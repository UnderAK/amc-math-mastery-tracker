import { supabase } from '@/lib/supabaseClient';


export type TestName = {
  id: string;
  name: string;
};

export const getAllTests = async (): Promise<TestName[]> => {
  const { data, error } = await supabase
    .from('tests')
    .select('id, name, questions (count)')
    .gt('questions.count', 0);

  if (error) {
    console.error('Error fetching tests:', error);
    return [];
  }

  return data.map(({ id, name }) => ({ id, name })) || [];
};

export const getTestById = async (id: string) => {
  const { data, error } = await supabase
    .from('tests')
    .select(`
      id,
      name,
      year,
      competition,
      questions (
        id,
        question_number,
        answer,
        topic
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching test with id ${id}:`, error);
    return null;
  }

  return data;
};
