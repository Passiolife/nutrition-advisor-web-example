
# Passio Nutrition AI Advisor Demo

This project, `nadvisor-chatui`, is a React-based chat UI demo for the Passio Nutrition Advisor. It leverages modern web technologies such as React 18, TypeScript, and TailwindCSS. Configured to run with Node.js v19.2.0, this demo includes scripts for building and deploying environments in both development and production modes.

## Prerequisites

- Git
- Node.js (v19.2.0)
- npm (comes with Node.js)

## Setting Up Node.js with nvm

To use the specified version of Node.js, install and use Node.js v19.2.0 via nvm (Node Version Manager):

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
# or
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

# Restart terminal and install Node.js v19.2.0
nvm install 19.2.0
nvm use 19.2.0
```

## Getting Started

### Clone the Repository

Clone this repository to your local machine to get started:

```bash
git clone https://github.com/Passiolife/nutrition-advisor-web-example.git
cd nutrition-advisor-web-example
```

### Setup Environment

Create a `.env.development` file in the root directory of the project (`.env.example` provided) and enter your license key:

```
REACT_APP_LICENSE_KEY="your license key here"
```

Replace `"your license key here"` with your actual license key.

### Install Dependencies

Install the necessary dependencies by running:

```bash
npm install
```

### Start the Application

Start the application locally:

```bash
npm start
```

This will launch the application on `http://localhost:3003`. Enjoy exploring the Passio Nutrition AI Advisor!
