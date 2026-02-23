export type TConfig = {
  db_url: string;
  jwt_secret: string;
  jwt_expires_in: number;
  frontend_url: string;
  port: number;
};

export default (): TConfig => ({
  db_url: process.env.DATABASE_URL!,
  jwt_secret: process.env.JWT_SECRET!,
  jwt_expires_in: +process.env.JWT_EXPIRES_IN,
  frontend_url: process.env.FRONTEND_URL!,
  port: +process.env.PORT,
});
