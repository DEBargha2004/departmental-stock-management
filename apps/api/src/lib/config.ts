export type TConfig = {
  db_url: string;
};

export default (): TConfig => ({
  db_url: process.env.DATABASE_URL!,
});
