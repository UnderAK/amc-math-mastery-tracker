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

import getAMC10Data from './scrapeFromAoPS.js';
import fs from 'fs';
import path from 'path';

const outputDir = path.join(process.cwd(), 'scripts');
const outputPath = path.join(outputDir, 'amc10.json');

const run = async () => {
  console.log('Starting AoPS scraper...');

  try {
    // The scraper will call this function to report progress
    const progressCallback = (message) => {
      console.log(message);
    };

    const data = await getAMC10Data(progressCallback);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log(`\n✅ Successfully scraped all data!`);
    console.log(`Data saved to: ${outputPath}`);

  } catch (error) {
    console.error('\n❌ An error occurred during scraping:');
    console.error(error);
    process.exit(1);
  }
};

run();
