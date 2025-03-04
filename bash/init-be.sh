echo "Initializing Nimble code challenge server..."

if ! command -v yarn &> /dev/null; then
    read -p "Yarn is not installed. Do you want to install yarn? (y/N) " answer
    if [[ "$answer" =~ ^[Yy]$ ]]; then
        echo "Installing yarn..."
        npm install -g yarn
    else
        echo "Yarn is required to run this project. Please install yarn and try again."
        exit 1
    fi
fi

echo "Creating .env file..."
cp .env.example .env

echo "Installing dependencies..."
yarn install

echo "Generating Prisma client..."
yarn prisma:g

echo "Nimble code challenge server initialized!"

echo "Run 'yarn dev' to start Nimble code challenge server"
