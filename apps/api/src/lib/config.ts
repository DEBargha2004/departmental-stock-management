export type TConfig = {
  db_url: string;
  jwt_secret: string;
  jwt_expires_in: number;
  frontend_url: string;
  port: number;
  admin_name: string;
  admin_email: string;
  admin_password: string;
  minio_access_key: string;
  minio_secret_key: string;
  minio_region: string;
  minio_endpoint: string;
  minio_bucket: string;
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
  minio_access_key: process.env.MINIO_ACCESS_KEY!,
  minio_secret_key: process.env.MINIO_SECRET_KEY!,
  minio_region: process.env.MINIO_REGION!,
  minio_endpoint: process.env.MINIO_ENDPOINT!,
  minio_bucket: process.env.MINIO_BUCKET!,
});
