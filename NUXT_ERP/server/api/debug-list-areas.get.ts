
export default defineEventHandler(async (event) => {
    const result = await executeQuery('SELECT id, name, icon FROM areas');
    return result;
});
