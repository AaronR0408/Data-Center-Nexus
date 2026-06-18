pipeline {
    agent any

    environment {
        PORT = "5173"
        BASE_PATH = "/"
        NODE_ENV = "production"

        // Docker (for A7)
        DOCKER_IMAGE = "dcn-app"
        DOCKER_TAG = "${env.BUILD_NUMBER}"
    }

    stages {

        /* =========================
           1. Checkout (A2)
        ========================== */
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /* =========================
           2. Verify Environment
        ========================== */
        stage('Verify Environment') {
            steps {
                sh '''
                node -v
                npm -v
                pnpm -v
                '''
            }
        }

        /* =========================
           3. Install Dependencies
        ========================== */
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

        /* =========================
           4. Type Check (A5)
        ========================== */
        stage('Type Check') {
            steps {
                sh '''
                pnpm run typecheck
                '''
            }
        }

        /* =========================
           5. Lint (A5 requirement)
        ========================== */
        stage('Lint') {
            steps {
                sh '''
                echo "Add ESLint here if available"
                '''
            }
        }

        /* =========================
           6. Build Frontend (FIXED VITE ISSUE)
        ========================== */
        stage('Build Frontend') {
            steps {
                dir('artifacts/dcim-frontend') {
                    sh '''
                    export PORT=$PORT
                    export BASE_PATH=$BASE_PATH
                    pnpm run build
                    '''
                }
            }
        }

        /* =========================
           7. Build API Server
        ========================== */
        stage('Build API Server') {
            steps {
                dir('artifacts/api-server') {
                    sh '''
                    pnpm run build
                    '''
                }
            }
        }

        /* =========================
           8. JMeter Placeholder (A6)
        ========================== */
        stage('Performance Test (JMeter)') {
            steps {
                echo "Run JMeter test here (.jmx file execution)"
            }
        }

        /* =========================
           9. Docker Build (A7)
        ========================== */
        stage('Docker Build') {
            steps {
                sh '''
                docker build -t $DOCKER_IMAGE:$DOCKER_TAG .
                docker tag $DOCKER_IMAGE:$DOCKER_TAG $DOCKER_IMAGE:latest
                '''
            }
        }

        /* =========================
           10. Deploy (A8)
        ========================== */
        stage('Deploy') {
            steps {
                echo "Deploying application..."
                echo "Docker Image: $DOCKER_IMAGE:$DOCKER_TAG"
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completed successfully"
        }

        failure {
            echo "❌ Pipeline failed"
        }

        always {
            cleanWs()
        }
    }
}
