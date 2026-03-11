pipeline {
    agent any

    tools {
        nodejs "NodeJS" // Ensure NodeJS is configured in Jenkins Global Tools Configuration
    }

    environment {
        FRONTEND_DIR = "revshop-app"
        SSH_CONFIG_NAME = "frontend-server" // Jenkins SSH Publisher config name for the EC2 server
        REMOTE_DOCROOT = "/usr/share/nginx/html"    // Nginx document root on Amazon Linux
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                dir("${FRONTEND_DIR}") {
                    // Use npm ci for clean and reliable installations
                    bat 'npm install'
                }
            }
            post {
                success {
                    echo "Dependencies installed successfully."
                }
                failure {
                    echo "Failed to install dependencies."
                }
            }
        }

        stage('Build') {
            steps {
                dir("${FRONTEND_DIR}") {
                    // Build the Angular project
                    bat 'npm run build'
                }
            }
            post {
                success {
                    echo "Build successful. Files are inside the dist/ folder."
                }
                failure {
                    echo "Frontend build failed."
                }
            }
        }

        stage('Deploy to EC2 (Nginx)') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sshPublisher(
                        publishers: [
                            sshPublisherDesc(
                                configName: "${SSH_CONFIG_NAME}",
                                verbose: true,
                                transfers: [
                                    sshTransfer(
                                        // Angular 17+ outputs to dist/app-name/browser/
                                        // Adjust to 'dist/revshop-app/**/*' if using older versions
                                        sourceFiles: "dist/revshop-app/browser/**/*",
                                        removePrefix: "dist/revshop-app/browser",
                                        remoteDirectory: "${REMOTE_DOCROOT}",
                                        flatten: false,
                                        execCommand: "sudo systemctl restart nginx || true" // Restart Nginx if applicable
                                    )
                                ]
                            )
                        ]
                    )
                }
            }
            post {
                success {
                    echo "Frontend deployed successfully to EC2."
                }
            }
        }
    }
}
