export type TConfig = {
  db_url: string;
  jwt_secret: string;
  jwt_expires_in: number;
  frontend_url: string;
  port: number;
  admin_name: string;
  admin_email: string;
  admin_password: string;
};

export default (): TConfig => ({
  db_url: process.env.DATABASE_URL!,
  jwt_secret: process.env.JWT_SECRET!,
  jwt_expires_in: +process.env.JWT_EXPIRES_IN,
  frontend_url: process.env.FRONTEND_URL!,
  port: +process.env.PORT,
  admin_name: process.env.ADMIN_NAME!,
  admin_email: process.env.ADMIN_EMAIL!,
  admin_password: process.env.ADMIN_PASSWORD!,
});
