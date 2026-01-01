@echo off
SET /P msg="Enter Commit Message: "

echo.
echo --- STEP 1: Adding changes ---
git add .

echo.
echo --- STEP 2: Committing ---
git commit -m "%msg%"

echo.
echo --- STEP 3: Pushing to GitHub ---
git push origin main

echo.
echo --- STEP 4: Building React App ---
call npm run build

echo.
echo --- STEP 5: Deploying to Firebase ---
call firebase deploy

echo.
echo DONE! Your site is updated.
pause
