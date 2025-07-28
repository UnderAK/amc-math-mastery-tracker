export const PRELOADED_ANSWER_KEYS: Record<string, string> = {
  '2023_amc12a': 'DCECEDAAEBEABBEADCBEBCDAE',
  '2023_amc12b': 'BADDADABCCEDDEBCDAEBAECBE',
  '2022_amc12a': 'CACDEBDEEBCDDDCBADCEBDCAD',
  '2022_amc12b': 'BDCACADDBCEEABDADADDBEBEA',
  '2021_fall_amc12a': 'BADEBDBCCCEDDEBCAABDBADBC',
  '2021_fall_amc12b': 'DDBACCABBECAEDBADADACADCB',
};

export const PRELOADED_TEST_OPTIONS = Object.keys(PRELOADED_ANSWER_KEYS).map(key => ({
  value: key,
  label: key.replace(/_/g, ' ').replace(/(amc12[ab])/, (match) => match.toUpperCase()),
}));
