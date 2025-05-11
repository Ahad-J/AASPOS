@echo off
echo Creating POS frontend src structure...

:: Navigate or create src directory
mkdir src

:: API Layer
mkdir src\api
type nul > src\api\authService.js
type nul > src\api\managerService.js
type nul > src\api\auditorService.js
type nul > src\api\salesService.js
type nul > src\api\index.js

:: Assets
mkdir src\assets

:: Components
mkdir src\components
mkdir src\components\layout
type nul > src\components\layout\Header.js
type nul > src\components\layout\Sidebar.js
type nul > src\components\layout\Footer.js

mkdir src\components\ui
type nul > src\components\ui\Button.js
type nul > src\components\ui\Input.js
type nul > src\components\ui\Table.js
type nul > src\components\ui\Modal.js

mkdir src\components\dashboard
type nul > src\components\dashboard\EmployeeForm.js
type nul > src\components\dashboard\ProductForm.js
type nul > src\components\dashboard\CustomerForm.js
type nul > src\components\dashboard\BillReceipt.js

:: Contexts
mkdir src\contexts
type nul > src\contexts\AuthContext.js

:: Hooks
mkdir src\hooks
type nul > src\hooks\useAuth.js
type nul > src\hooks\useApi.js

:: Pages
mkdir src\pages
mkdir src\pages\auth
type nul > src\pages\auth\Login.js
type nul > src\pages\auth\Register.js

mkdir src\pages\manager
type nul > src\pages\manager\Dashboard.js
type nul > src\pages\manager\Employees.js
type nul > src\pages\manager\Reports.js

mkdir src\pages\auditor
type nul > src\pages\auditor\Dashboard.js
type nul > src\pages\auditor\Inventory.js
type nul > src\pages\auditor\Suppliers.js

mkdir src\pages\sales
type nul > src\pages\sales\Dashboard.js
type nul > src\pages\sales\Billing.js
type nul > src\pages\sales\Customers.js

type nul > src\pages\Home.js

:: Routes
mkdir src\routes
type nul > src\routes\AppRoutes.js
type nul > src\routes\PrivateRoute.js

:: Styles
mkdir src\styles
type nul > src\styles\main.css
type nul > src\styles\theme.js

:: Utils
mkdir src\utils
type nul > src\utils\helpers.js
type nul > src\utils\constants.js

:: Root files
type nul > src\App.js
type nul > src\index.js

echo Structure created under /src successfully!
pause
