# AI_Reply
A NodeJS tool that you can use to generate AI generated responses to emails from your G-Mail account! Use this to readily create a draft to the last received email, and customize it your way before hitting the send button!

** Note: I will try to make this project go live after implementing certain other features, so that this can be used by users without hastle

Steps to use it:

1. As the tool admin, only the developer has the access to a certain file known as credentials.json
2. For generating your own credentials, follow the steps in this file: https://developers.google.com/workspace/guides/get-started
3. After downloading the credentails.json, you need to start the redis server, which supports the BullMQ queue.
4. If you're on a windows system, you can use WSL (Windows subsystems for Linux), or if you're on a Linux machine already, you're halfway there
5. To install WSL in your windows machine, follow these following steps
    A. wsl --install
    B. sudo apt update
    C. sudo apt install redis-server
    D. After installation, run `sudo service redis-server start` to start the redis server
6. Now, run the project in your local system for yourself, by running the commnand: npm run dev
7. Happy Replying!