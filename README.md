# 🌽 maize

a daily standup tool

## Installation

1. Fork and clone the repository:
```bash
git clone https://github.com/you/maize.git
cd maize
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start Convex development server:
```bash
npx convex dev
```

6. Start the development server in another tab:
```bash
npm run dev
```

## Configuration

### Prerequisites

- Node.js (v20 or higher)
- npm
- A Convex account (for backend functionality)
- An Auth0 account (for authentication)
- A Netlify/Vercel account (for deployment)

### Backend Setup

1. **Convex Setup**
   - Create a new project in [Convex](https://www.convex.dev)
   - Get your project ID from the Convex dashboard
   - Login to Convex:
     ```bash
     convex login
     ```
   - Set up Convex environment variables:
    - Go to your Convex dashboard: https://dashboard.convex.dev
    - Navigate to Settings > Environment Variables
    - Add the following variables:
      - `AUTH0_DOMAIN` - Your Auth0 domain
      - `AUTH0_CLIENT_ID` - Your Auth0 client ID

2. **Auth0 Setup**
   - Create a new application in [Auth0](https://auth0.com)
   - Set the following in your Auth0 application settings:
     - Allowed Callback URLs: `http://localhost:3000` (development) and your deployment URL
     - Allowed Logout URLs: `http://localhost:3000` (development) and your deployment URL
     - Allowed Web Origins: `http://localhost:3000` (development) and your deployment URL
   - Get your Auth0 domain and client ID
   - Update your `.env` file with the Auth0 credentials:
     ```env
     VITE_AUTH0_DOMAIN=your_auth0_domain
     VITE_AUTH0_CLIENT_ID=your_auth0_client_id
     ```

### Deployment

1. Push your code to GitHub
2. Connect your repository to Netlify/Vercel
3. Configure the following build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 20 (or higher)

4. Add the following environment variables:
   - `CONVEX_DEPLOY_KEY` - From your Convex dashboard
   - `VITE_AUTH0_DOMAIN` - Your Auth0 domain
   - `VITE_AUTH0_CLIENT_ID` - Your Auth0 client ID

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - Run TypeScript type checking

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
