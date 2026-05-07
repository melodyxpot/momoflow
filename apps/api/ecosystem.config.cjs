module.exports = {
  apps: [
    {
      name: "momoflow-api",
      script: "dist/server.js",
      cwd: __dirname,
      instances: "max",
      exec_mode: "cluster",
      env: { NODE_ENV: "production" },
      max_memory_restart: "512M",
      kill_timeout: 8000,
    },
  ],
};
