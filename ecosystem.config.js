module.exports = {
    apps: [{
        name: 'playa-backend',
        script: './dist/index.js', // Changed from public to dist
        instances: 1, // Changed from 'max' (not recommended for databases)
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production'
        },
        env_file: '.env',
        // Add these new properties
        error_file: './logs/pm2-errors.log',
        out_file: './logs/pm2-output.log',
        time: true,
        interpreter_args: '--require ts-node/register --require tsconfig-paths/register'
    }]
}