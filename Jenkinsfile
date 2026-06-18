pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Environment') {
            steps {
                sh '''
                node -v
                npm -v
                pnpm -v
                '''
            }
        }

      stage('Install Dependencies') {
    steps {
        sh '''
        pnpm install --no-frozen-lockfile --config.ignore-scripts=false
        pnpm rebuild esbuild
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
                echo 'Deployment completed'
            }
        }
    }
}
