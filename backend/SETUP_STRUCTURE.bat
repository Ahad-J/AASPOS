@echo off
:: Folders
mkdir models
mkdir controllers
mkdir routes

:: Files
echo // app.js > app.js

echo // models/db.js > models\db.js
echo // models/managerModel.js > models\managerModel.js
echo // models/salesModel.js > models\salesModel.js
echo // models/auditorModel.js > models\auditorModel.js

echo // controllers/managerController.js > controllers\managerController.js
echo // controllers/salesController.js > controllers\salesController.js
echo // controllers/auditorController.js > controllers\auditorController.js

echo // routes/managerRoutes.js > routes\managerRoutes.js
echo // routes/salesRoutes.js > routes\salesRoutes.js
echo // routes/auditorRoutes.js > routes\auditorRoutes.js

echo Folder and file structure created!
pause
