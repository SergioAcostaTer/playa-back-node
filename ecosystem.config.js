module.exports = {
    apps: [{
        name: 'playa-backend',
        script: './public/index.js',
        instances: 'max',
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
            APP_PORT: 8001,
        },
        env_file: '.env'
    }]
}