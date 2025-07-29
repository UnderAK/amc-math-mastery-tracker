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

import fetch from 'cross-fetch';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

async function getDOM(link) {
	try {
		var data = await fetch(link);
	} catch {
		console.error('Could not fetch data from ' + link);
		return null;
	}
	if (!data.ok) {
		console.error(`Failed to fetch ${link}, status: ${data.status}`);
		return null;
	}
	const dataJSON = await data.json();
	if (!dataJSON || !dataJSON.parse || !dataJSON.parse.text) {
		console.error(`Invalid API response from ${link}. Page might not exist.`);
		return null;
	}
	return new JSDOM(dataJSON.parse.text['*']);
}

async function getAMC12Data(logProgress) {
	const contestListDOM = await getDOM('https://artofproblemsolving.com/wiki/api.php?action=parse&page=AMC_12_Problems_and_Solutions&format=json');
	if (!contestListDOM) {
		console.error('Could not fetch the main contest list. Aborting.');
		return {};
	}

	let finalData = {};

	const contestLinks = contestListDOM.window.document.querySelectorAll('tr > td > a');

	for (let contestLink of contestLinks) {
		const serializedContestTitle = contestLink.title.replace(/\ /g, '_');

		if (isNaN(parseInt(contestLink.title[0]))) continue;

		finalData[serializedContestTitle] = {
			title: serializedContestTitle,
			year: Number(serializedContestTitle.slice(0, 4)),
			formattedTitle: contestLink.title + ' Contest',
			link: 'https://artofproblemsolving.com' + contestLink.href,
			problems: {},
		};

		logProgress(`Processing Contest: ${contestLink.title}`);

		const contestProblemListDOM = await getDOM(`https://artofproblemsolving.com/wiki/api.php?action=parse&page=${serializedContestTitle}&format=json`);
		const contestAnswerListDOM = await getDOM(`https://artofproblemsolving.com/wiki/api.php?action=parse&page=${serializedContestTitle}_Answer_Key&format=json`);

		if (!contestProblemListDOM || !contestAnswerListDOM) {
			logProgress(`  -> Skipping ${contestLink.title} due to missing problem or answer pages.`);
			continue;
		}

		let problemLinks = contestProblemListDOM.window.document.querySelectorAll('li > ul > li > a');
		if (problemLinks.length == 0) {
			problemLinks = Array.from(contestProblemListDOM.window.document.querySelectorAll('ul > li > a')).filter((t) => t.textContent.includes('Problem '));
		}
		const answers = contestAnswerListDOM.window.document.querySelectorAll('ol > li');

		let problemPromises = [];

		for (let [problemIndex, problemLink] of problemLinks.entries()) {
			problemPromises.push(
				new Promise(async (resolve) => {
					const serializedProblemTitle = problemLink.title.replace(/\ /g, '_');
					const problemData = {
						title: serializedProblemTitle,
						formattitle: 'Problem ' + String(problemIndex + 1),
						contest: serializedContestTitle,
						link: 'https://artofproblemsolving.com' + problemLink.href,
						data: {
							problem: '',
							solutions: [],
							answer: answers[problemIndex]?.textContent || 'N/A',
						},
					};

					let problemDOM = await getDOM(`https://artofproblemsolving.com/wiki/api.php?action=parse&page=${serializedProblemTitle}&format=json`);

					if (problemDOM && problemDOM.window.document.querySelector('.redirectMsg')) {
						logProgress(`  -> Redirect on ${serializedProblemTitle}`);
						const newTarget = problemDOM.window.document.querySelector('li > a').title.split(' ').join('_');
						problemDOM = await getDOM(`https://artofproblemsolving.com/wiki/api.php?action=parse&page=${newTarget}&format=json`);
					}

					if (!problemDOM) {
						logProgress(`  -> Could not fetch DOM for ${serializedProblemTitle}`);
						finalData[serializedContestTitle].problems[serializedProblemTitle] = problemData;
						resolve();
						return;
					}

					const problemInfoEle = problemDOM.window.document.querySelector('.mw-parser-output');
					problemInfoEle.querySelectorAll('.mw-editsection').forEach((e) => e.remove());
					problemInfoEle.querySelectorAll('a').forEach((link) => {
						if (link.href.startsWith('/wiki')) {
							link.href = 'https://artofproblemsolving.com' + link.href;
						}
					});

					let mode = null;
					let currentSolution = null;

					for (let curEle of problemInfoEle.children) {
						if (curEle.tagName === 'H2') {
							const text = curEle.textContent.toLowerCase();
							if (text.startsWith('problem')) {
								mode = 'problem';
							} else if (text.includes('solution')) {
								mode = 'solution';
								currentSolution = { title: curEle.textContent, text: '' };
								problemData.data.solutions.push(currentSolution);
							} else {
								mode = null;
							}
						} else if (mode) {
							if (mode === 'problem') {
								problemData.data.problem += curEle.outerHTML;
							} else if (mode === 'solution' && currentSolution) {
								currentSolution.text += curEle.outerHTML;
							}
						}
					}

					finalData[serializedContestTitle].problems[serializedProblemTitle] = problemData;
					logProgress(`  -> Got ${serializedProblemTitle}`);
					resolve();
				})
			);
		}
		await Promise.all(problemPromises);
	}

	return finalData;
}

async function main() {
	console.log('Starting AMC 12 scraper...');
	const scrapedData = await getAMC12Data(console.log);
	const outputPath = path.join(process.cwd(), 'scripts', 'amc12.json');
	fs.writeFileSync(outputPath, JSON.stringify(scrapedData, null, 2));
	console.log(`\n✅ AMC 12 data scraped successfully and saved to ${outputPath}`);
}

main().catch((error) => {
	console.error('\n❌ An error occurred during the AMC 12 scraping process:');
	console.error(error);
	process.exit(1);
});
