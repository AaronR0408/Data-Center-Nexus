pipeline {
    agent any

    tools {
        nodejs 'NodeJS-22'
    }

    environment {
        PNPM_HOME = "${WORKSPACE}/.pnpm"
        PATH = "${PNPM_HOME}:${env.PATH}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install PNPM') {
            steps {
                sh '''
                npm install -g pnpm
                pnpm --version
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                pnpm install --no-frozen-lockfile
                '''
            }
        }

        stage('Type Check') {
            steps {
                sh '''
                pnpm run typecheck
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                pnpm run build
                '''
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deployment Stage Completed'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
