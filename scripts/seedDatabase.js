/**
 * AMC Math Mastery Tracker
 * Copyright (C) 2025 Aarav Tibrewal
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL; // Use the VITE_ prefixed URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Supabase URL or Service Role Key is missing. Make sure to create a .env file.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const seedDatabase = async () => {
  const dataFiles = ['amc10.json', 'amc12.json', 'amc8.json', 'ahsme.json']; // Add more files here as needed

  for (const fileName of dataFiles) {
    const dataPath = path.join(process.cwd(), 'scripts', fileName);

    if (!fs.existsSync(dataPath)) {
      console.warn(`
⚠️  Warning: Data file not found at ${dataPath}. Skipping.`);
      continue;
    }

    console.log(`
--- Processing ${fileName} ---`);
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const allContests = JSON.parse(rawData);

    console.log('Starting to seed the database. This may take a while...');

    for (const contestKey in allContests) {
      const contest = allContests[contestKey];
      console.log(`Processing contest: ${contest.formattedTitle}`);

      // Check if the test already exists
      const { data: existingTest, error: selectError } = await supabase
        .from('tests')
        .select('id')
        .eq('name', contest.formattedTitle)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error(`Error checking for test ${contest.formattedTitle}:`, selectError.message);
        continue;
      }

      if (existingTest) {
        console.log(`  -> Test already exists. Skipping.`);
        continue;
      }

      // 1. Insert the test into the 'tests' table
      const { data: testData, error: testError } = await supabase
        .from('tests')
        .insert({
          name: contest.formattedTitle,
          year: contest.year,
          competition: contest.title,
        })
        .select('id')
        .single();

      if (testError) {
        console.error(`Error inserting test ${contest.formattedTitle}:`, testError.message);
        continue; // Skip to the next contest if this one fails
      }

    const testId = testData.id;
    console.log(`  -> Inserted test with ID: ${testId}`);

    // 2. Prepare all questions for this test for a bulk insert
    const questionsToInsert = Object.values(contest.problems).map((problem) => {
      const questionNumber = parseInt(problem.formattitle.replace('Problem ', ''), 10);
      return {
        test_id: testId,
        question_number: isNaN(questionNumber) ? 0 : questionNumber,
        problem_html: problem.data.problem,
        answer: problem.data.answer,
        solutions_html: problem.data.solutions, // This is already a JSONB-compatible array
      };
    });

    if (questionsToInsert.length === 0) {
        console.log('  -> No problems found for this test. Skipping.');
        continue;
    }

    // 3. Bulk insert all questions for the current test
    const { error: questionsError } = await supabase.from('questions').insert(questionsToInsert);

    if (questionsError) {
      console.error(`Error inserting questions for ${contest.formattedTitle}:`, questionsError.message);
    } else {
      console.log(`  -> Successfully inserted ${questionsToInsert.length} questions.`);
    }
    }
  }

  console.log('\n✅ Database seeding completed for all files!');
};

seedDatabase().catch((error) => {
  console.error('\n❌ An error occurred during database seeding:');
  console.error(error);
  process.exit(1);
});
