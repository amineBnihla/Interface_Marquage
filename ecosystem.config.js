module.exports = {
  apps: [{
    name: 'packone_marquage',
    script: 'node_modules/next/dist/bin/next',
    cwd: 'C:/packone/packone_marquage',
    args: 'start -p 3030',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
     autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    kill_timeout: 5000, // ADD THIS - wait 5s before force killing
    wait_ready: true, // ADD THIS - wait for app to be ready
    listen_timeout: 10000, // ADD THIS - wait 10s for app to start
    env: {
      NODE_ENV: 'production',
      PORT: 3030
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
