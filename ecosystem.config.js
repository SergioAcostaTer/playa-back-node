module.exports = {
    apps: [{
        name: 'playa-backend',
        script: './public/index.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
            PORT: 5150
        },
        env_file: '.env',
        // Add these new properties
        error_file: './logs/pm2-errors.log',
        out_file: './logs/pm2-output.log',
        time: true,
        interpreter_args: '--require ts-node/register --require tsconfig-paths/register'
    }]
}