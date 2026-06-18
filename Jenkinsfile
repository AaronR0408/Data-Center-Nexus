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

        stage('PNPM Debug') {
    steps {
        sh '''
        pnpm config list
        '''
    }
}
     stage('Install Dependencies') {
    steps {
        sh '''
        pnpm config set strict-dep-builds false
        pnpm config set ignore-scripts false
        pnpm install --no-frozen-lockfile
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
