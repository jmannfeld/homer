# Homer Command Line Interface

## CLI for managing tags and branches in Git repositories

If **Herodotus** (often considered the "Father of History") is to **Python** (a programming language known for its readability and storytelling-like structure), then a comparable figure for **JavaScript** would be **Homer** (the ancient Greek poet famous for epic tales like The Iliad and The Odyssey).

### ❓ Why Homer?

**Herodotus & Python:** Herodotus was a historian who emphasized storytelling, much like how Python is designed to be readable and structured in a way that emphasizes clarity.

**Homer & JavaScript:**
Homer’s works were dynamic, widely influential, and foundational to Western literature—just as JavaScript is to web development. JavaScript is also more dynamic and flexible, much like how Homer’s oral traditions evolved with time.

# 🚀 Project Setup

Follow these steps to set up the project:

## Prerequisites

- Ensure you have [nvm](https://github.com/nvm-sh/nvm) installed.
- Ensure you have [Node.js and npm](https://nodejs.org/en) installed.

## Installation Steps

### 1. Install and Use the Correct Node Version

Run the following command to install and use the correct Node.js version (uses the version in `.nvmrc`):

```sh
nvm install && nvm use
```

### 2. Install Dependencies

Run the following command to install the necessary dependencies:

```sh
npm install
```

### 3. Link the CLI

Run the following command to link the package so that you can use the `homer` CLI globally:

```sh
npm link
```

### 4. Use the CLI

🎉 You're all set!
Now you can start using the project. 🚀

## 📌 Usage

Run `homer` to display the available commands:

```sh
homer
```

### ❓ Help

```sh
homer -h
homer --help
```

### 🔹 Display Version

```sh
homer -v
homer --version
```

## ⚙️ Commands

### 🏷️ Tag Management

Create a pre-release tag:

```sh
homer tag
```

- In the `main` branch, this command creates `-dev` tags.
- In `release/X.X` branches, this command creates `-rc` tags.
- In all other branches, this command creates and increments tags based on the branch name.

Create a final release tag:

```sh
homer tag final
```

- In `release/X.X` branches, this command creates final tags.

### 🔀 Branch Management

Create a new minor release branch:

```sh
homer fork minor
```

- Creates a minor release branch (e.g., `release/1.3`).

Create a new major release branch:

```sh
homer fork major
```

Creates a major release branch (e.g., `release/2.0`).
