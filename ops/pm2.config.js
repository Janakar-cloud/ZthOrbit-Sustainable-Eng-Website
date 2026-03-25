const appRoot = "/var/www/zthorbit/ZthOrbit-Sustainable-Eng-Website";

export default {
  apps: [
    {
      name: "thegreentv-api",
      script: "dist/index.js",
      cwd: `${appRoot}/server`,
      instances: 1,
      exec_mode: "fork",
      watch: false,
      time: true,
      merge_logs: true,
      log_file: `${appRoot}/logs/thegreentv-api.log`,
      error_file: `${appRoot}/logs/thegreentv-api-error.log`,
      out_file: `${appRoot}/logs/thegreentv-api-out.log`,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};