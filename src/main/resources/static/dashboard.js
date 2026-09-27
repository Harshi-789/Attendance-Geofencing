/* =========================================================

   ATTENDTRACK DASHBOARD JAVASCRIPT

   ========================================================= */

/* =========================================================

   API CONFIGURATION

   ========================================================= */

const API = {

    employees: "/employees",

    departments: "/departments",

    offices: "/office-locations",

    attendance: "/attendances"

};


/* =========================================================

   GLOBAL VARIABLES

   ========================================================= */

let currentEmployee = null;

let currentOffice = null;

let currentAttendance = null;

let editingEmployeeId = null;

let deletingEmployeeId = null;

let allEmployees = [];

let allDepartments = [];


/* =========================================================

   DOM READY

   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeDashboard();

});


/* =========================================================

   INITIALIZE DASHBOARD

   ========================================================= */

function initializeDashboard() {

    const token = getToken();

    if (!token) {

        window.location.href = "index.html";

        return;

    }

    initializeClock();

    initializeNavigation();

    initializeMobileMenu();

    initializeLogout();

    initializeAttendanceButtons();

    initializeEmployeeManagement();

    loadUserInformation();

    loadOfficeLocation();

    showDefaultSection();

}


/* =========================================================

   AUTHENTICATION

   ========================================================= */

function getToken() {

    return (

        localStorage.getItem("jwtToken") ||

        sessionStorage.getItem("jwtToken")

    );

}


function getStoredEmail() {

    return (

        localStorage.getItem("userEmail") ||

        sessionStorage.getItem("userEmail")

    );

}


function getHeaders() {

    const token = getToken();

    return {

        "Content-Type": "application/json",

        "Authorization": `Bearer ${token}`

    };

}


/* =========================================================

   JWT ROLE

   ========================================================= */

function getUserRole() {

    const token = getToken();

    if (!token) {

        return null;

    }

    try {

        const parts = token.split(".");

        if (parts.length !== 3) {

            return null;

        }

        const payload = JSON.parse(

            atob(

                parts[1]

                    .replace(/-/g, "+")

                    .replace(/_/g, "/")

            )

        );

        return payload.role || null;

    } catch (error) {

        console.error("Unable to decode JWT:", error);

        return null;

    }

}


/* =========================================================

   CLOCK / DATE

   ========================================================= */

function initializeClock() {

    updateDate();

    setInterval(updateDate, 60000);

}


function updateDate() {

    const dateElement =

        document.getElementById("currentDate");

    if (!dateElement) {

        return;

    }

    const now = new Date();

    dateElement.textContent =

        now.toLocaleDateString("en-IN", {

            weekday: "long",

            day: "numeric",

            month: "long",

            year: "numeric"

        });

}


/* =========================================================

   NAVIGATION

   ========================================================= */

function initializeNavigation() {

    const navLinks =

        document.querySelectorAll(".nav-link[data-section]");

    navLinks.forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();

            const section =

                link.dataset.section;

            showSection(section);

            closeMobileMenu();

        });

    });


    const sectionButtons =

        document.querySelectorAll("[data-section]");

    sectionButtons.forEach(button => {

        if (button.classList.contains("nav-link")) {

            return;

        }

        button.addEventListener("click", event => {

            event.preventDefault();

            const section =

                button.dataset.section;

            if (section) {

                showSection(section);

            }

        });

    });

}


function showDefaultSection() {

    showSection("dashboard");

}


function showSection(sectionName) {

    const sections =

        document.querySelectorAll(".page-section");

    sections.forEach(section => {

        section.classList.remove("active");

    });


    const targetSection =

        document.getElementById(

            `${sectionName}Section`

        );

    if (targetSection) {

        targetSection.classList.add("active");

    }


    const navLinks =

        document.querySelectorAll(

            ".nav-link[data-section]"

        );

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (

            link.dataset.section === sectionName

        ) {

            link.classList.add("active");

        }

    });


    updatePageTitle(sectionName);


    if (sectionName === "employees") {

        loadEmployees();

    }

    if (sectionName === "departments") {

        loadDepartments();

    }

    if (sectionName === "offices") {

        loadOffices();

    }

    if (sectionName === "reports") {

        initializeReportFilter();

        loadAdminReports();

    }

    if (sectionName === "attendance") {

        loadAttendanceHistory();

    }

}


/* =========================================================

   PAGE TITLE

   ========================================================= */

function updatePageTitle(sectionName) {

    const pageTitle =

        document.getElementById("pageTitle");

    if (!pageTitle) {

        return;

    }

    const titles = {

        dashboard: "Dashboard",

        attendance: "My Attendance",

        profile: "My Profile",

        employees: "Employee Management",

        departments: "Department Management",

        offices: "Office Locations",

        reports: "Attendance Reports"

    };

    pageTitle.textContent =

        titles[sectionName] || "Dashboard";

}


/* =========================================================

   MOBILE MENU

   ========================================================= */

function initializeMobileMenu() {

    const menuButton =

        document.getElementById("mobileMenuBtn");

    const sidebar =

        document.getElementById("sidebar");

    const overlay =

        document.getElementById("mobileOverlay");


    if (menuButton) {

        menuButton.addEventListener("click", () => {

            sidebar?.classList.toggle("open");

            overlay?.classList.toggle("show");

        });

    }


    if (overlay) {

        overlay.addEventListener("click", () => {

            closeMobileMenu();

        });

    }

}


function closeMobileMenu() {

    document

        .getElementById("sidebar")

        ?.classList.remove("open");

    document

        .getElementById("mobileOverlay")

        ?.classList.remove("show");

}


/* =========================================================

   LOGOUT

   ========================================================= */

function initializeLogout() {

    const logoutButton =

        document.getElementById("logoutBtn");

    if (!logoutButton) {

        return;

    }

    logoutButton.addEventListener("click", () => {

        localStorage.removeItem("jwtToken");

        localStorage.removeItem("userEmail");

        sessionStorage.removeItem("jwtToken");

        sessionStorage.removeItem("userEmail");

        window.location.href = "index.html";

    });

}


/* =========================================================

   LOAD USER INFORMATION

   ========================================================= */

async function loadUserInformation() {

    const email = getStoredEmail();

    if (!email) {

        return;

    }

    try {

        const response = await fetch(

            `${API.employees}`,

            {

                method: "GET",

                headers: getHeaders()

            }

        );


        if (response.status === 401) {

            logoutUser();

            return;

        }


        if (!response.ok) {

            throw new Error(

                "Unable to load employees"

            );

        }


        const employees =

            await response.json();


        currentEmployee =

            employees.find(

                employee =>

                    employee.email?.toLowerCase() ===

                    email.toLowerCase()

            );


        if (!currentEmployee) {

            console.warn(

                "Logged-in employee not found."

            );

            return;

        }


        updateUserUI();

        loadEmployeeAttendance();


        const role =

            getNormalizedRole(

                currentEmployee.role

            );


        if (role === "ADMIN") {

            showAdminNavigation();

        }


    } catch (error) {

        console.error(

            "User loading error:",

            error

        );

    }

}


/* =========================================================

   NORMALIZE ROLE

   ========================================================= */

function getNormalizedRole(role) {

    if (!role) {

        return "";

    }

    return role

        .toString()

        .replace("ROLE_", "")

        .toUpperCase();

}


/* =========================================================

   UPDATE USER UI

   ========================================================= */

function updateUserUI() {

    if (!currentEmployee) {

        return;

    }


    const name =

        currentEmployee.name || "User";


    const role =

        getNormalizedRole(

            currentEmployee.role

        );


    const initials =

        getInitials(name);


    const welcomeName =

        document.getElementById("welcomeName");

    if (welcomeName) {

        welcomeName.textContent = name;

    }


    const topUserName =

        document.getElementById("topUserName");

    if (topUserName) {

        topUserName.textContent = name;

    }


    const topUserRole =

        document.getElementById("topUserRole");

    if (topUserRole) {

        topUserRole.textContent =

            role === "ADMIN"

                ? "Administrator"

                : "Employee";

    }


    const avatar =

        document.getElementById("topUserAvatar");

    if (avatar) {

        avatar.textContent = initials;

    }


    const profileAvatar =

        document.getElementById("profileAvatar");

    if (profileAvatar) {

        profileAvatar.textContent = initials;

    }


    const profileName =

        document.getElementById("profileName");

    if (profileName) {

        profileName.textContent = name;

    }


    const profileFullName =

        document.getElementById("profileFullName");

    if (profileFullName) {

        profileFullName.textContent = name;

    }


    const profileEmail =

        document.getElementById("profileEmail");

    if (profileEmail) {

        profileEmail.textContent =

            currentEmployee.email || "--";

    }


    const profilePhone =

        document.getElementById("profilePhone");

    if (profilePhone) {

        profilePhone.textContent =

            currentEmployee.phone || "--";

    }


    const designation =

        currentEmployee.designation || "Employee";


    const profileDesignation =

        document.getElementById(

            "profileDesignation"

        );

    if (profileDesignation) {

        profileDesignation.textContent =

            designation;

    }


    const profileDesignationValue =

        document.getElementById(

            "profileDesignationValue"

        );

    if (profileDesignationValue) {

        profileDesignationValue.textContent =

            designation;

    }


    const profileRole =

        document.getElementById("profileRole");

    if (profileRole) {

        profileRole.textContent =

            role || "--";

    }


    const profileStatus =

        document.getElementById("profileStatus");

    if (profileStatus) {

        profileStatus.textContent =

            currentEmployee.status || "--";

    }

}


/* =========================================================

   INITIALS

   ========================================================= */

function getInitials(name) {

    if (!name) {

        return "U";

    }

    return name

        .trim()

        .split(/\s+/)

        .map(word => word.charAt(0))

        .join("")

        .substring(0, 2)

        .toUpperCase();

}


/* =========================================================

   ADMIN NAVIGATION

   ========================================================= */

function showAdminNavigation() {

    const adminNavigation =

        document.getElementById(

            "adminNavigation"

        );

    if (adminNavigation) {

        adminNavigation.style.display = "block";

    }

}


/* =========================================================

   ATTENDANCE BUTTONS

   ========================================================= */

function initializeAttendanceButtons() {

    const checkInBtn =

        document.getElementById("checkInBtn");

    const checkOutBtn =

        document.getElementById("checkOutBtn");


    if (checkInBtn) {

        checkInBtn.addEventListener(

            "click",

            performCheckIn

        );

    }


    if (checkOutBtn) {

        checkOutBtn.addEventListener(

            "click",

            performCheckOut

        );

    }

}


/* =========================================================

   CHECK IN

   ========================================================= */

async function performCheckIn() {

    if (!currentEmployee) {

        showAttendanceMessage(

            "Employee information is not available.",

            "error"

        );

        return;

    }


    setAttendanceButtonLoading(

        "checkInBtn",

        true,

        "Checking location..."

    );


    try {

        const location =

            getAttendanceLocation();


        const request = {

            employeeId:

                currentEmployee.employeeId,

            latitude:

                location.latitude,

            longitude:

                location.longitude

        };


        const response =

            await fetch(

                `${API.attendance}/check-in`,

                {

                    method: "POST",

                    headers: getHeaders(),

                    body: JSON.stringify(request)

                }

            );


        const data =

            await readResponse(response);


        if (response.status === 401) {

            logoutUser();

            return;

        }


        if (!response.ok) {

            throw new Error(

                extractErrorMessage(data)

            );

        }


        currentAttendance = data;


        showAttendanceMessage(

            "Check-in successful.",

            "success"

        );


        updateAttendanceUI(data);

        loadEmployeeAttendance();


    } catch (error) {

        console.error(

            "Check-in error:",

            error

        );

        showAttendanceMessage(

            error.message ||

            "Unable to check in.",

            "error"

        );

    } finally {

        setAttendanceButtonLoading(

            "checkInBtn",

            false

        );

    }

}


/* =========================================================

   CHECK OUT

   ========================================================= */

async function performCheckOut() {

    if (!currentEmployee) {

        showAttendanceMessage(

            "Employee information is not available.",

            "error"

        );

        return;

    }


    setAttendanceButtonLoading(

        "checkOutBtn",

        true,

        "Checking location..."

    );


    try {

        const location =

            getAttendanceLocation();


        const request = {

            employeeId:

                currentEmployee.employeeId,

            latitude:

                location.latitude,

            longitude:

                location.longitude

        };


        const response =

            await fetch(

                `${API.attendance}/check-out`,

                {

                    method: "POST",

                    headers: getHeaders(),

                    body: JSON.stringify(request)

                }

            );


        const data =

            await readResponse(response);


        if (response.status === 401) {

            logoutUser();

            return;

        }


        if (!response.ok) {

            throw new Error(

                extractErrorMessage(data)

            );

        }


        currentAttendance = data;


        showAttendanceMessage(

            "Check-out successful.",

            "success"

        );


        updateAttendanceUI(data);

        loadEmployeeAttendance();


    } catch (error) {

        console.error(

            "Check-out error:",

            error

        );

        showAttendanceMessage(

            error.message ||

            "Unable to check out.",

            "error"

        );

    } finally {

        setAttendanceButtonLoading(

            "checkOutBtn",

            false

        );

    }

}


/* =========================================================

   GEOLOCATION

   ========================================================= */

function getAttendanceLocation() {

    if (

        !currentOffice ||

        currentOffice.latitude == null ||

        currentOffice.longitude == null

    ) {

        throw new Error(

            "Office location is not available. Please try again."

        );

    }

    return {

        latitude: Number(currentOffice.latitude),

        longitude: Number(currentOffice.longitude)

    };

}


/* =========================================================

   BROWSER GEOLOCATION

   =========================================================

   Kept for future use.

   Current attendance uses the configured office coordinates.

   ========================================================= */

function getCurrentLocation() {

    return new Promise(

        (resolve, reject) => {

            if (!navigator.geolocation) {

                reject(

                    new Error(

                        "Geolocation is not supported by your browser."

                    )

                );

                return;

            }


            navigator.geolocation.getCurrentPosition(

                position => {

                    resolve({

                        latitude:

                            position.coords.latitude,

                        longitude:

                            position.coords.longitude

                    });

                },

                error => {

                    let message =

                        "Unable to get your location.";


                    if (error.code === 1) {

                        message =

                            "Location permission was denied. Please allow location access.";

                    } else if (error.code === 2) {

                        message =

                            "Your location could not be determined.";

                    } else if (error.code === 3) {

                        message =

                            "Location request timed out.";

                    }


                    reject(

                        new Error(message)

                    );

                },

                {

                    enableHighAccuracy: true,

                    timeout: 10000,

                    maximumAge: 0

                }

            );

        }

    );

}


/* =========================================================

   ATTENDANCE BUTTON LOADING

   ========================================================= */

function setAttendanceButtonLoading(

    buttonId,

    loading,

    text = ""

) {

    const button =

        document.getElementById(buttonId);

    if (!button) {

        return;

    }


    if (loading) {

        button.disabled = true;

        button.dataset.originalText =

            button.innerHTML;

        button.innerHTML =

            `<i class="fa-solid fa-spinner fa-spin"></i> ${text}`;

    } else {

        button.disabled = false;

        if (button.dataset.originalText) {

            button.innerHTML =

                button.dataset.originalText;

        }

    }

}


/* =========================================================

   ATTENDANCE MESSAGE

   ========================================================= */

function showAttendanceMessage(

    message,

    type = "info"

) {

    const element =

        document.getElementById(

            "attendanceMessage"

        );

    if (!element) {

        return;

    }


    element.textContent = message;
    element.classList.remove("success", "error", "info");
    element.classList.add(type);

}


/* =========================================================

   LOAD EMPLOYEE ATTENDANCE

   ========================================================= */

async function loadEmployeeAttendance() {

    if (!currentEmployee) {

        return;

    }


    try {

        const response =

            await fetch(

                `${API.attendance}/employee/${currentEmployee.employeeId}`,

                {

                    method: "GET",

                    headers: getHeaders()

                }

            );


        if (response.status === 401) {

            logoutUser();

            return;

        }


        if (!response.ok) {

            throw new Error(

                "Unable to load attendance."

            );

        }


        const records =

            await response.json();


        updateAttendanceHistory(records);

        updateTodayAttendance(records);


    } catch (error) {

        console.error(

            "Attendance loading error:",

            error

        );

    }

}


/* =========================================================

   LOAD ATTENDANCE HISTORY

   ========================================================= */

async function loadAttendanceHistory() {

    if (!currentEmployee) {

        return;

    }


    try {

        const response =

            await fetch(

                `${API.attendance}/employee/${currentEmployee.employeeId}`,

                {

                    method: "GET",

                    headers: getHeaders()

                }

            );


        if (!response.ok) {

            throw new Error(

                "Unable to load attendance history."

            );

        }


        const records =

            await response.json();


        updateAttendanceHistory(records);

    } catch (error) {

        console.error(error);

    }

}


/* =========================================================

   UPDATE ATTENDANCE HISTORY

   ========================================================= */

function updateAttendanceHistory(records) {

    const historyBody =

        document.getElementById(

            "attendanceHistoryBody"

        );

    const recentBody =

        document.getElementById(

            "recentAttendanceBody"

        );


    if (!Array.isArray(records)) {

        records = [];

    }


    records.sort(

        (a, b) =>

            new Date(

                b.date || 0

            ) -

            new Date(

                a.date || 0

            )

    );


    if (historyBody) {

        if (records.length === 0) {

            historyBody.innerHTML = `

                <tr>

                    <td colspan="4" class="empty-row">

                        No attendance records found.

                    </td>

                </tr>

            `;

        } else {

            historyBody.innerHTML =

                records

                    .map(

                        record =>

                            createAttendanceRow(

                                record

                            )

                    )

                    .join("");

        }

    }


    if (recentBody) {

        const recentRecords =

            records.slice(0, 5);


        if (recentRecords.length === 0) {

            recentBody.innerHTML = `

                <tr>

                    <td colspan="4" class="empty-row">

                        No attendance records found.

                    </td>

                </tr>

            `;

        } else {

            recentBody.innerHTML =

                recentRecords

                    .map(

                        record =>

                            createAttendanceRow(

                                record

                            )

                    )

                    .join("");

        }

    }

}


/* =========================================================

   ATTENDANCE TABLE ROW

   ========================================================= */

function createAttendanceRow(record) {

    return `

        <tr>

            <td>

                ${formatDate(record.date)}

            </td>

            <td>

                ${formatDateTime(record.checkInTime)}

            </td>

            <td>

                ${formatDateTime(record.checkOutTime)}

            </td>

            <td>

                ${createStatusBadge(record.status)}

            </td>

        </tr>

    `;

}


/* =========================================================

   TODAY ATTENDANCE

   ========================================================= */

function updateTodayAttendance(records) {

    const now = new Date();
    const today =
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;


    const todayRecord =

        records.find(

            record =>

                record.date === today

        );


    if (!todayRecord) {

        currentAttendance = null;

        setText(

            "todayStatus",

            "Not Checked In"

        );

        setText(

            "checkInTime",

            "--:--"

        );

        setText(

            "checkOutTime",

            "--:--"

        );

        return;

    }


    currentAttendance = todayRecord;

    updateAttendanceUI(todayRecord);

}


/* =========================================================

   UPDATE ATTENDANCE UI

   ========================================================= */

function updateAttendanceUI(record) {

    if (!record) {

        return;

    }


    setText(

        "todayStatus",

        formatStatusText(

            record.status

        )

    );


    setText(

        "checkInTime",

        formatTime(

            record.checkInTime

        )

    );


    setText(

        "checkOutTime",

        formatTime(

            record.checkOutTime

        )

    );


    const checkInBtn =

        document.getElementById(

            "checkInBtn"

        );

    const checkOutBtn =

        document.getElementById(

            "checkOutBtn"

        );


    if (

        record.checkInTime &&

        checkInBtn

    ) {

        checkInBtn.disabled = true;

        checkInBtn.innerHTML =

            `<i class="fa-solid fa-check"></i> Checked In`;

    }


    if (

        record.checkOutTime &&

        checkOutBtn

    ) {

        checkOutBtn.disabled = true;

        checkOutBtn.innerHTML =

            `<i class="fa-solid fa-check"></i> Checked Out`;

    }

}


/* =========================================================

   LOAD OFFICE

   ========================================================= */

async function loadOfficeLocation() {

    try {

        const response =

            await fetch(

                API.offices,

                {

                    method: "GET",

                    headers: getHeaders()

                }

            );


        if (response.status === 401) {

            logoutUser();

            return;

        }


        if (!response.ok) {

            throw new Error(

                "Unable to load office location."

            );

        }


        const data =

            await response.json();


        currentOffice =

            Array.isArray(data)

                ? data[0]

                : data;


        updateOfficeUI();


    } catch (error) {

        console.error(

            "Office loading error:",

            error

        );

        setText(

            "locationStatus",

            "Unavailable"

        );

    }

}


/* =========================================================

   UPDATE OFFICE UI

   ========================================================= */

function updateOfficeUI() {

    if (!currentOffice) {

        return;

    }


    setText(

        "officeName",

        currentOffice.officeName ||

        "Office Location"

    );


    setText(

        "officeCoordinates",

        `${currentOffice.latitude}, ${currentOffice.longitude}`

    );


    setText(

        "officeRadius",

        `${currentOffice.radius || 0} m`

    );


    setText(

        "locationStatus",

        "Available"

    );

}


/* =========================================================

   EMPLOYEE MANAGEMENT INITIALIZATION

   ========================================================= */

function initializeEmployeeManagement() {

    const addButton =

        document.getElementById(

            "addEmployeeBtn"

        );


    if (addButton) {

        addButton.addEventListener(

            "click",

            openAddEmployeeModal

        );

    }


    const addDepartmentButton =

        document.getElementById(

            "addDepartmentBtn"

        );


    if (addDepartmentButton) {

        addDepartmentButton.addEventListener(

            "click",

            addDepartment

        );

    }


    const closeButton =

        document.getElementById(

            "closeEmployeeModal"

        );


    if (closeButton) {

        closeButton.addEventListener(

            "click",

            closeEmployeeModal

        );

    }


    const cancelButton =

        document.getElementById(

            "cancelEmployeeBtn"

        );


    if (cancelButton) {

        cancelButton.addEventListener(

            "click",

            closeEmployeeModal

        );

    }


    const employeeForm =

        document.getElementById(

            "employeeForm"

        );


    if (employeeForm) {

        employeeForm.addEventListener(

            "submit",

            saveEmployee

        );

    }


    const search =

        document.getElementById(

            "employeeSearch"

        );


    if (search) {

        search.addEventListener(

            "input",

            filterEmployees

        );

    }


    const cancelDelete =

        document.getElementById(

            "cancelDeleteBtn"

        );


    if (cancelDelete) {

        cancelDelete.addEventListener(

            "click",

            closeDeleteEmployeeModal

        );

    }


    const confirmDelete =

        document.getElementById(

            "confirmDeleteBtn"

        );


    if (confirmDelete) {

        confirmDelete.addEventListener(

            "click",

            confirmDeleteEmployee

        );

    }


    const employeeModal =

        document.getElementById(

            "employeeModal"

        );


    if (employeeModal) {

        employeeModal.addEventListener(

            "click",

            event => {

                if (

                    event.target === employeeModal

                ) {

                    closeEmployeeModal();

                }

            }

        );

    }


    const deleteModal =

        document.getElementById(

            "deleteEmployeeModal"

        );


    if (deleteModal) {

        deleteModal.addEventListener(

            "click",

            event => {

                if (

                    event.target === deleteModal

                ) {

                    closeDeleteEmployeeModal();

                }

            }

        );

    }

}


/* =========================================================

   LOAD EMPLOYEES

   ========================================================= */

async function loadEmployees() {

    const tableBody =

        document.getElementById(

            "employeesTableBody"

        );


    if (tableBody) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="7" class="empty-row">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Loading employees...

                </td>

            </tr>

        `;

    }


    try {

        const response =

            await fetch(

                API.employees,

                {

                    method: "GET",

                    headers: getHeaders()

                }

            );


        if (response.status === 401) {

            logoutUser();

            return;

        }


        if (response.status === 403) {

            throw new Error(

                "You do not have permission to view employees."

            );

        }


        if (!response.ok) {

            throw new Error(

                "Unable to load employees."

            );

        }


        const data =

            await response.json();


        allEmployees =

            Array.isArray(data)

                ? data

                : [];


        updateEmployeeStatistics(

            allEmployees

        );


        await loadDepartmentsForEmployeeForm();


        renderEmployees(

            allEmployees

        );


    } catch (error) {

        console.error(

            "Employee loading error:",

            error

        );


        if (tableBody) {

            tableBody.innerHTML = `

                <tr>

                    <td colspan="7" class="empty-row">

                        ${escapeHtml(error.message)}

                    </td>

                </tr>

            `;

        }

    }

}


/* =========================================================

   EMPLOYEE STATISTICS

   ========================================================= */

function updateEmployeeStatistics(

    employees

) {

    const total =

        employees.length;


    const active =

        employees.filter(

            employee =>

                String(employee.status)

                    .toUpperCase() === "ACTIVE"

        ).length;


    const inactive =

        total - active;


    setText(

        "totalEmployees",

        total

    );


    setText(

        "activeEmployees",

        active

    );


    setText(

        "inactiveEmployees",

        inactive

    );

}


/* =========================================================

   RENDER EMPLOYEES

   ========================================================= */

function renderEmployees(

    employees

) {

    const tableBody =

        document.getElementById(

            "employeesTableBody"

        );


    if (!tableBody) {

        return;

    }


    if (!employees.length) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="7" class="empty-row">

                    <i class="fa-solid fa-users"></i>

                    <br>

                    No employees found.

                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =

        employees

            .map(

                employee =>

                    createEmployeeRow(

                        employee

                    )

            )

            .join("");

}


/* =========================================================

   CREATE EMPLOYEE ROW

   ========================================================= */

function createEmployeeRow(

    employee

) {

    const name =

        employee.name || "Unknown";


    const initials =

        getInitials(name);


    const department =

        getDepartmentName(

            employee

        );


    const role =

        getNormalizedRole(

            employee.role

        );


    const status =

        String(

            employee.status || ""

        ).toUpperCase();


    return `

        <tr>

            <td>

                <div class="employee-table-user">

                    <div class="employee-avatar">

                        ${escapeHtml(initials)}

                    </div>

                    <div>

                        <div class="employee-name">

                            ${escapeHtml(name)}

                        </div>

                        <div class="employee-email">

                            ID: ${escapeHtml(

        employee.employeeId

    )}

                        </div>

                    </div>

                </div>

            </td>


            <td>

                ${escapeHtml(

        employee.email || "--"

    )}

            </td>


            <td>

                ${escapeHtml(

        employee.designation || "--"

    )}

            </td>


            <td>

                ${escapeHtml(

        department

    )}

            </td>


            <td>

                ${createRoleBadge(role)}

            </td>


            <td>

                ${createEmployeeStatusBadge(

        status

    )}

            </td>


            <td>

                <div class="employee-actions">

                    <button

                        type="button"

                        class="icon-action edit"

                        title="Edit Employee"

                        onclick="openEditEmployeeModal(${employee.employeeId})">

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button

                        type="button"

                        class="icon-action delete"

                        title="Delete Employee"

                        onclick="openDeleteEmployeeModal(${employee.employeeId})">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>

        </tr>

    `;

}


/* =========================================================

   DEPARTMENT NAME

   ========================================================= */

function getDepartmentName(

    employee

) {

    if (

        employee.department &&

        employee.department.departmentName

    ) {

        return employee.department.departmentName;

    }


    if (

        employee.departmentName

    ) {

        return employee.departmentName;

    }


    if (

        employee.department &&

        employee.department.name

    ) {

        return employee.department.name;

    }


    return "--";

}


/* =========================================================

   ROLE BADGE

   ========================================================= */

function createRoleBadge(

    role

) {

    const className =

        role === "ADMIN"

            ? "admin"

            : "employee";


    return `

        <span class="status-badge ${className}">

            ${escapeHtml(role || "EMPLOYEE")}

        </span>

    `;

}


/* =========================================================

   EMPLOYEE STATUS BADGE

   ========================================================= */

function createEmployeeStatusBadge(

    status

) {

    const className =

        status === "ACTIVE"

            ? "active"

            : "inactive";


    return `

        <span class="status-badge ${className}">

            <i class="fa-solid fa-circle"></i>

            ${escapeHtml(status || "UNKNOWN")}

        </span>

    `;

}


/* =========================================================

   LOAD DEPARTMENTS FOR FORM

   ========================================================= */

async function loadDepartmentsForEmployeeForm() {

    const select =

        document.getElementById(

            "employeeDepartment"

        );


    if (!select) {

        return;

    }


    try {

        const response =

            await fetch(

                API.departments,

                {

                    method: "GET",

                    headers: getHeaders()

                }

            );


        if (!response.ok) {

            return;

        }


        const departments =

            await response.json();


        allDepartments =

            Array.isArray(departments)

                ? departments

                : [];


        select.innerHTML = `

            <option value="">

                Select Department

            </option>

        `;


        allDepartments.forEach(

            department => {

                const option =

                    document.createElement(

                        "option"

                    );

                option.value =

                    department.departmentId;

                option.textContent =

                    department.departmentName;

                select.appendChild(option);

            }

        );


    } catch (error) {

        console.error(

            "Department loading error:",

            error

        );

    }

}


/* =========================================================

   OPEN ADD EMPLOYEE MODAL

   ========================================================= */

function openAddEmployeeModal() {

    editingEmployeeId = null;


    const modal =

        document.getElementById(

            "employeeModal"

        );


    const form =

        document.getElementById(

            "employeeForm"

        );


    if (form) {

        form.reset();

    }


    setText(

        "employeeModalTitle",

        "Add Employee"

    );


    const password =

        document.getElementById(

            "employeePassword"

        );


    if (password) {

        password.required = true;

        password.placeholder =

            "Enter password";

    }


    setText(

        "passwordHint",

        "Required when creating an employee."

    );


    clearEmployeeFormMessage();


    if (

        allDepartments.length === 0

    ) {

        loadDepartmentsForEmployeeForm();

    }


    if (modal) {

        modal.classList.add("show");

    }

}


/* =========================================================

   OPEN EDIT EMPLOYEE MODAL

   ========================================================= */

async function openEditEmployeeModal(

    employeeId

) {

    const employee =

        allEmployees.find(

            item =>

                Number(item.employeeId) ===

                Number(employeeId)

        );


    if (!employee) {

        showGlobalMessage(

            "Employee information not found.",

            "error"

        );

        return;

    }


    editingEmployeeId =

        employee.employeeId;


    const modal =

        document.getElementById(

            "employeeModal"

        );


    setText(

        "employeeModalTitle",

        "Edit Employee"

    );


    setValue(

        "employeeId",

        employee.employeeId

    );


    setValue(

        "employeeName",

        employee.name

    );


    setValue(

        "employeeEmail",

        employee.email

    );


    setValue(

        "employeePhone",

        employee.phone

    );


    setValue(

        "employeeDesignation",

        employee.designation

    );


    setValue(

        "employeeRole",

        getNormalizedRole(

            employee.role

        ) || "EMPLOYEE"

    );


    setValue(

        "employeeStatus",

        employee.status || "ACTIVE"

    );


    const password =

        document.getElementById(

            "employeePassword"

        );


    if (password) {

        password.value = "";

        password.required = false;

        password.placeholder =

            "Leave blank to keep current password";

    }


    setText(

        "passwordHint",

        "Leave blank if you do not want to change the password."

    );


    await loadDepartmentsForEmployeeForm();


    const departmentId =

        getEmployeeDepartmentId(

            employee

        );


    if (departmentId !== null) {

        setValue(

            "employeeDepartment",

            departmentId

        );

    }


    clearEmployeeFormMessage();


    if (modal) {

        modal.classList.add("show");

    }

}


/* =========================================================

   GET EMPLOYEE DEPARTMENT ID

   ========================================================= */

function getEmployeeDepartmentId(

    employee

) {

    if (

        employee.department &&

        employee.department.departmentId

    ) {

        return employee.department.departmentId;

    }


    if (

        employee.departmentId

    ) {

        return employee.departmentId;

    }


    return null;

}


/* =========================================================

   CLOSE EMPLOYEE MODAL

   ========================================================= */

function closeEmployeeModal() {

    const modal =

        document.getElementById(

            "employeeModal"

        );


    if (modal) {

        modal.classList.remove("show");

    }


    editingEmployeeId = null;

    clearEmployeeFormMessage();

}


/* =========================================================

   SAVE EMPLOYEE

   ========================================================= */

async function saveEmployee(

    event

) {

    event.preventDefault();


    const name =

        getValue("employeeName").trim();


    const email =

        getValue("employeeEmail").trim();


    const password =

        getValue("employeePassword").trim();


    const phone =

        getValue("employeePhone").trim();


    const designation =

        getValue("employeeDesignation").trim();


    const departmentId =

        getValue("employeeDepartment");


    const role =

        getValue("employeeRole");


    const status =

        getValue("employeeStatus");


    if (!name || !email || !designation) {

        showEmployeeFormMessage(

            "Please fill all required fields.",

            "error"

        );

        return;

    }


    if (

        !editingEmployeeId &&

        !password

    ) {

        showEmployeeFormMessage(

            "Password is required when creating an employee.",

            "error"

        );

        return;

    }


    const employeeData = {

        name: name,

        email: email,

        phone: phone,

        designation: designation,

        role: role,

        status: status

    };


    /*

     * Password is sent only when:

     * 1. Creating a new employee

     * 2. Editing and user entered a new password

     */

    if (password) {

        employeeData.password =

            password;

    }


    /*

     * Department is represented

     * using departmentId.

     */

    if (departmentId) {

        employeeData.department = {

            departmentId:

                Number(departmentId)

        };

    }


    const saveButton =

        document.getElementById(

            "saveEmployeeBtn"

        );


    if (saveButton) {

        saveButton.disabled = true;

        saveButton.innerHTML =

            `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

    }


    try {

        const isEditing =

            Boolean(editingEmployeeId);


        const url =

            isEditing

                ? `${API.employees}/${editingEmployeeId}`

                : API.employees;


        const method =

            isEditing

                ? "PUT"

                : "POST";


        const response =

            await fetch(

                url,

                {

                    method: method,

                    headers: getHeaders(),

                    body: JSON.stringify(

                        employeeData

                    )

                }

            );


        const data =

            await readResponse(response);


        if (response.status === 401) {

            logoutUser();

            return;

        }


        if (response.status === 403) {

            throw new Error(

                "You do not have permission to manage employees."

            );

        }


        if (!response.ok) {

            throw new Error(

                extractErrorMessage(data)

            );

        }


        showEmployeeFormMessage(

            isEditing

                ? "Employee updated successfully."

                : "Employee created successfully.",

            "success"

        );


        setTimeout(

            async () => {

                closeEmployeeModal();

                await loadEmployees();

            },

            600

        );


    } catch (error) {

        console.error(

            "Save employee error:",

            error

        );


        showEmployeeFormMessage(

            error.message ||

            "Unable to save employee.",

            "error"

        );


    } finally {

        if (saveButton) {

            saveButton.disabled = false;

            saveButton.innerHTML =

                `<i class="fa-solid fa-floppy-disk"></i> Save Employee`;

        }

    }

}


/* =========================================================

   OPEN DELETE EMPLOYEE MODAL

   ========================================================= */

function openDeleteEmployeeModal(

    employeeId

) {

    const employee =

        allEmployees.find(

            item =>

                Number(item.employeeId) ===

                Number(employeeId)

        );


    if (!employee) {

        return;

    }


    deletingEmployeeId =

        employee.employeeId;


    setText(

        "deleteEmployeeName",

        employee.name || "this employee"

    );


    const modal =

        document.getElementById(

            "deleteEmployeeModal"

        );


    if (modal) {

        modal.classList.add("show");

    }

}


/* =========================================================

   CLOSE DELETE MODAL

   ========================================================= */

function closeDeleteEmployeeModal() {

    const modal =

        document.getElementById(

            "deleteEmployeeModal"

        );


    if (modal) {

        modal.classList.remove("show");

    }


    deletingEmployeeId = null;

}


/* =========================================================

   CONFIRM DELETE EMPLOYEE

   ========================================================= */

async function confirmDeleteEmployee() {

    if (!deletingEmployeeId) {

        return;

    }


    const button =

        document.getElementById(

            "confirmDeleteBtn"

        );


    if (button) {

        button.disabled = true;

        button.innerHTML =

            `<i class="fa-solid fa-spinner fa-spin"></i> Deleting...`;

    }


    try {

        const response =

            await fetch(

                `${API.employees}/${deletingEmployeeId}`,

                {

                    method: "DELETE",

                    headers: getHeaders()

                }

            );


        const data =

            await readResponse(response);


        if (response.status === 401) {

            logoutUser();

            return;

        }


        if (response.status === 403) {

            throw new Error(

                "You do not have permission to delete employees."

            );

        }


        if (!response.ok) {

            throw new Error(

                extractErrorMessage(data)

            );

        }


        closeDeleteEmployeeModal();


        await loadEmployees();


        showGlobalMessage(

            "Employee deleted successfully.",

            "success"

        );


    } catch (error) {

        console.error(

            "Delete employee error:",

            error

        );


        showGlobalMessage(

            error.message ||

            "Unable to delete employee.",

            "error"

        );


    } finally {

        if (button) {

            button.disabled = false;

            button.innerHTML =

                `<i class="fa-solid fa-trash"></i> Delete Employee`;

        }

    }

}


/* =========================================================

   SEARCH EMPLOYEES

   ========================================================= */

function filterEmployees(

    event

) {

    const searchText =

        event.target.value

            .trim()

            .toLowerCase();


    if (!searchText) {

        renderEmployees(

            allEmployees

        );

        return;

    }


    const filtered =

        allEmployees.filter(

            employee => {

                const name =

                    String(

                        employee.name || ""

                    ).toLowerCase();


                const email =

                    String(

                        employee.email || ""

                    ).toLowerCase();


                const designation =

                    String(

                        employee.designation || ""

                    ).toLowerCase();


                const role =

                    String(

                        employee.role || ""

                    ).toLowerCase();


                const department =

                    getDepartmentName(

                        employee

                    ).toLowerCase();


                return (

                    name.includes(searchText) ||

                    email.includes(searchText) ||

                    designation.includes(searchText) ||

                    role.includes(searchText) ||

                    department.includes(searchText)

                );

            }

        );


    renderEmployees(

        filtered

    );

}


/* =========================================================

   DEPARTMENT MANAGEMENT

   ========================================================= */

async function addDepartment() {

    const departmentName = window.prompt(

        "Enter department name:"

    );

    if (departmentName === null) {

        return;

    }

    const name = departmentName.trim();

    if (!name) {

        showGlobalMessage(

            "Department name is required.",

            "error"

        );

        return;

    }

    const button =

        document.getElementById("addDepartmentBtn");

    if (button) {

        button.disabled = true;

        button.dataset.originalText =

            button.innerHTML;

        button.innerHTML =

            `<i class="fa-solid fa-spinner fa-spin"></i> Adding...`;

    }

    try {

        const response = await fetch(

            API.departments,

            {

                method: "POST",

                headers: getHeaders(),

                body: JSON.stringify({

                    departmentName: name

                })

            }

        );

        const data = await readResponse(response);

        if (response.status === 401) {

            logoutUser();

            return;

        }

        if (response.status === 403) {

            throw new Error(

                "You do not have permission to add departments."

            );

        }

        if (!response.ok) {

            throw new Error(

                extractErrorMessage(data)

            );

        }

        await loadDepartments();

        await loadDepartmentsForEmployeeForm();

        showGlobalMessage(

            "Department added successfully.",

            "success"

        );

    } catch (error) {

        console.error(

            "Add department error:",

            error

        );

        showGlobalMessage(

            error.message ||

            "Unable to add department.",

            "error"

        );

    } finally {

        if (button) {

            button.disabled = false;

            if (button.dataset.originalText) {

                button.innerHTML =

                    button.dataset.originalText;

            }

        }

    }

}


async function loadDepartments() {

    const tableBody =

        document.getElementById(

            "departmentsTableBody"

        );


    if (!tableBody) {

        return;

    }


    try {

        const response =

            await fetch(

                API.departments,

                {

                    method: "GET",

                    headers: getHeaders()

                }

            );


        if (!response.ok) {

            throw new Error(

                "Unable to load departments."

            );

        }


        const departments =

            await response.json();


        allDepartments =

            Array.isArray(departments)

                ? departments

                : [];


        if (!allDepartments.length) {

            tableBody.innerHTML = `

                <tr>

                    <td colspan="3" class="empty-row">

                        No departments found.

                    </td>

                </tr>

            `;

            return;

        }


        tableBody.innerHTML =

            allDepartments

                .map(

                    department => `

                        <tr>

                            <td>

                                ${escapeHtml(

                        department.departmentId

                    )}

                            </td>

                            <td>

                                <strong>

                                    ${escapeHtml(

                        department.departmentName

                    )}

                                </strong>

                            </td>

                            <td>

                                <span class="status-badge active">

                                    Active

                                </span>

                            </td>

                        </tr>

                    `

                )

                .join("");


    } catch (error) {

        console.error(

            "Department loading error:",

            error

        );


        tableBody.innerHTML = `

            <tr>

                <td colspan="3" class="empty-row">

                    ${escapeHtml(error.message)}

                </td>

            </tr>

        `;

    }

}


/* =========================================================

   OFFICE MANAGEMENT

   ========================================================= */

async function loadOffices() {

    const tableBody =

        document.getElementById(

            "officesTableBody"

        );


    if (!tableBody) {

        return;

    }


    try {

        const response =

            await fetch(

                API.offices,

                {

                    method: "GET",

                    headers: getHeaders()

                }

            );


        if (!response.ok) {

            throw new Error(

                "Unable to load office locations."

            );

        }


        const data =

            await response.json();


        const offices =

            Array.isArray(data)

                ? data

                : [data];


        if (!offices.length) {

            tableBody.innerHTML = `

                <tr>

                    <td colspan="6" class="empty-row">

                        No office locations found.

                    </td>

                </tr>

            `;

            return;

        }


        tableBody.innerHTML =

            offices

                .map(

                    office => `

                        <tr>

                            <td>

                                ${escapeHtml(

                        office.officeLocationId

                    )}

                            </td>

                            <td>

                                <strong>

                                    ${escapeHtml(

                        office.officeName

                    )}

                                </strong>

                            </td>

                            <td>

                                ${escapeHtml(

                        office.latitude

                    )}

                            </td>

                            <td>

                                ${escapeHtml(

                        office.longitude

                    )}

                            </td>

                            <td>

                                ${escapeHtml(

                        office.radius

                    )} m

                            </td>

                            <td>

                                <span class="status-badge active">

                                    Active

                                </span>

                            </td>

                        </tr>

                    `

                )

                .join("");


    } catch (error) {

        console.error(

            "Office loading error:",

            error

        );


        tableBody.innerHTML = `

            <tr>

                <td colspan="6" class="empty-row">

                    ${escapeHtml(error.message)}

                </td>

            </tr>

        `;

    }

}


/* =========================================================

   ADMIN REPORTS

   ========================================================= */

function initializeReportFilter() {

    const datePicker =

        document.getElementById("reportDatePicker");

    const employeeFilter =

        document.getElementById("reportEmployeeFilter");

    const viewButton =

        document.getElementById("viewReportBtn");

    if (!datePicker || !viewButton) {

        return;

    }

    if (!datePicker.value) {

        datePicker.value = getTodayDate();

    }

    if (viewButton.dataset.initialized === "true") {

        return;

    }

    viewButton.dataset.initialized = "true";

    viewButton.addEventListener("click", () => {

        const selectedDate = datePicker.value;

        if (!selectedDate) {

            showGlobalMessage(

                "Please select a date.",

                "error"

            );

            return;

        }

        loadAdminReports(

            selectedDate,

            employeeFilter ? employeeFilter.value : ""

        );

    });

    datePicker.addEventListener("change", () => {

        loadAdminReports(

            datePicker.value,

            employeeFilter ? employeeFilter.value : ""

        );

    });

    if (employeeFilter) {

        employeeFilter.addEventListener("change", () => {

            loadAdminReports(

                datePicker.value,

                employeeFilter.value

            );

        });

    }

}


/* =========================================================

   EMPLOYEE FILTER

   ========================================================= */

function populateReportEmployeeFilter(

    employees,

    selectedEmployeeId = null

) {

    const employeeFilter =

        document.getElementById("reportEmployeeFilter");

    if (!employeeFilter) {

        return;

    }

    const currentValue =

        selectedEmployeeId !== null &&

            selectedEmployeeId !== undefined

            ? String(selectedEmployeeId)

            : employeeFilter.value;

    employeeFilter.innerHTML = `

        <option value="">All Employees</option>

        ${employees.map(employee => `

            <option value="${escapeHtml(employee.employeeId)}">

                ${escapeHtml(

        employee.name ||

        employee.email ||

        "Employee"

    )}

            </option>

        `).join("")}

    `;

    employeeFilter.value = currentValue || "";

}


/* =========================================================

   REPORT DATE HELPERS

   ========================================================= */

function getTodayDate() {

    const now = new Date();

    const year =

        now.getFullYear();

    const month =

        String(now.getMonth() + 1).padStart(2, "0");

    const day =

        String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function formatReportDate(dateString) {

    if (!dateString) {

        return "";

    }

    const parts =

        dateString.split("-");

    if (parts.length !== 3) {

        return dateString;

    }

    const date = new Date(

        Number(parts[0]),

        Number(parts[1]) - 1,

        Number(parts[2])

    );

    return date.toLocaleDateString(

        "en-IN",

        {

            day: "numeric",

            month: "short",

            year: "numeric"

        }

    );

}


/* =========================================================

   LOAD ADMIN REPORT

   ========================================================= */

async function loadAdminReports(

    selectedDate = null,

    selectedEmployeeId = null

) {

    try {

        initializeReportFilter();

        const reportDate =

            selectedDate || getTodayDate();

        const isToday =

            reportDate === getTodayDate();

        const attendanceUrl =

            isToday

                ? `${API.attendance}/today`

                : `${API.attendance}/date/${reportDate}`;

        const [

            employeesResponse,

            officesResponse,

            attendanceResponse

        ] = await Promise.all([

            fetch(

                API.employees,

                {

                    headers: getHeaders()

                }

            ),

            fetch(

                API.offices,

                {

                    headers: getHeaders()

                }

            ),

            fetch(

                attendanceUrl,

                {

                    headers: getHeaders()

                }

            )

        ]);

        if (

            employeesResponse.status === 401 ||

            officesResponse.status === 401 ||

            attendanceResponse.status === 401

        ) {

            logoutUser();

            return;

        }

        if (

            employeesResponse.status === 403 ||

            officesResponse.status === 403 ||

            attendanceResponse.status === 403

        ) {

            throw new Error(

                "You do not have permission to view this report."

            );

        }

        if (!employeesResponse.ok) {

            throw new Error(

                "Unable to load employees."

            );

        }

        if (!officesResponse.ok) {

            throw new Error(

                "Unable to load office locations."

            );

        }

        if (!attendanceResponse.ok) {

            throw new Error(

                "Unable to load attendance report."

            );

        }

        const employees =

            await employeesResponse.json();

        const offices =

            await officesResponse.json();

        const attendance =

            await attendanceResponse.json();

        const employeeList =

            Array.isArray(employees)

                ? employees

                : [];

        const officeList =

            Array.isArray(offices)

                ? offices

                : offices

                    ? [offices]

                    : [];

        const attendanceList =

            Array.isArray(attendance)

                ? attendance

                : [];

        populateReportEmployeeFilter(

            employeeList,

            selectedEmployeeId

        );

        const employeeFilter =

            document.getElementById(

                "reportEmployeeFilter"

            );

        const activeEmployeeId =

            selectedEmployeeId !== null &&

                selectedEmployeeId !== undefined &&

                selectedEmployeeId !== ""

                ? selectedEmployeeId

                : employeeFilter

                    ? employeeFilter.value

                    : "";

        const filteredAttendance =

            activeEmployeeId

                ? attendanceList.filter(

                    record =>

                        String(

                            record.employeeId

                        ) ===

                        String(

                            activeEmployeeId

                        )

                )

                : attendanceList;

        const pendingCheckout =

            filteredAttendance.filter(

                record =>

                    record.checkInTime &&

                    !record.checkOutTime

            ).length;

        setText(

            "reportTotalEmployees",

            employeeList.length

        );

        setText(

            "reportPresentToday",

            filteredAttendance.length

        );

        setText(

            "reportPendingCheckout",

            pendingCheckout

        );

        setText(

            "reportOfficeLocations",

            officeList.length

        );

        setText(

            "reportDate",

            formatReportDate(reportDate)

        );

        const selectedEmployee =

            employeeList.find(

                employee =>

                    String(

                        employee.employeeId

                    ) ===

                    String(

                        activeEmployeeId

                    )

            );

        const employeeTitle =

            selectedEmployee

                ? ` - ${selectedEmployee.name}`

                : "";

        setText(

            "reportTitle",

            isToday

                ? `Today's Attendance${employeeTitle}`

                : `Attendance on ${formatReportDate(

                    reportDate

                )}${employeeTitle}`

        );

        const datePicker =

            document.getElementById(

                "reportDatePicker"

            );

        if (

            datePicker &&

            datePicker.value !== reportDate

        ) {

            datePicker.value =

                reportDate;

        }

        renderTodayReport(

            filteredAttendance,

            reportDate

        );

    } catch (error) {

        console.error(

            "Report loading error:",

            error

        );

        const body =

            document.getElementById(

                "todayReportBody"

            );

        if (body) {

            body.innerHTML = `

                <tr>

                    <td

                        colspan="4"

                        class="empty-row"

                    >

                        ${escapeHtml(

                error.message ||

                "Unable to load attendance report."

            )}

                    </td>

                </tr>

            `;

        }

    }

}


/* =========================================================

   SELECTED DATE REPORT

   ========================================================= */

function renderTodayReport(records, reportDate = getTodayDate()) {

    const body = document.getElementById("todayReportBody");

    if (!body) {

        return;

    }

    if (!records.length) {

        body.innerHTML = `

            <tr>

                <td colspan="4" class="empty-row">

                    No attendance recorded for ${escapeHtml(formatReportDate(reportDate))}.

                </td>

            </tr>

        `;

        return;

    }

    body.innerHTML = records

        .map(record => `

            <tr>

                <td>

                    <strong>

                        ${escapeHtml(record.employeeName || "Unknown")}

                    </strong>

                    <br>

                    <small>

                        ${escapeHtml(record.employeeEmail || "")}

                    </small>

                </td>

                <td>

                    ${formatDateTime(record.checkInTime)}

                </td>

                <td>

                    ${formatDateTime(record.checkOutTime)}

                </td>

                <td>

                    ${createStatusBadge(record.status)}

                </td>

            </tr>

        `)

        .join("");

}


/* =========================================================

   STATUS BADGE

   ========================================================= */

function createStatusBadge(

    status

) {

    const normalized =

        String(

            status || "UNKNOWN"

        ).toUpperCase();


    let className = "pending";


    if (

        normalized === "COMPLETED" ||

        normalized === "PRESENT"

    ) {

        className = "completed";

    }


    if (

        normalized === "ABSENT" ||

        normalized === "INACTIVE"

    ) {

        className = "inactive";

    }


    return `

        <span class="status-badge ${className}">

            ${escapeHtml(

        formatStatusText(

            normalized

        )

    )}

        </span>

    `;

}


/* =========================================================

   STATUS TEXT

   ========================================================= */

function formatStatusText(

    status

) {

    if (!status) {

        return "--";

    }


    return status

        .toString()

        .replace(/_/g, " ")

        .toLowerCase()

        .replace(

            /\b\w/g,

            char => char.toUpperCase()

        );

}


/* =========================================================

   DATE FORMATTING

   ========================================================= */

function formatDate(

    value

) {

    if (!value) {

        return "--";

    }


    const date =

        new Date(value);


    if (isNaN(date.getTime())) {

        return value;

    }


    return date.toLocaleDateString(

        "en-IN",

        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }

    );

}


/* =========================================================

   DATETIME FORMATTING

   ========================================================= */

function formatDateTime(

    value

) {

    if (!value) {

        return "--";

    }


    const date =

        new Date(value);


    if (isNaN(date.getTime())) {

        return value;

    }


    return date.toLocaleString(

        "en-IN",

        {

            day: "2-digit",

            month: "short",

            hour: "2-digit",

            minute: "2-digit",

            hour12: true

        }

    );

}


/* =========================================================

   TIME FORMATTING

   ========================================================= */

function formatTime(

    value

) {

    if (!value) {

        return "--:--";

    }


    const date =

        new Date(value);


    if (isNaN(date.getTime())) {

        return value;

    }


    return date.toLocaleTimeString(

        "en-IN",

        {

            hour: "2-digit",

            minute: "2-digit",

            hour12: true

        }

    );

}


/* =========================================================

   HELPER: SET TEXT

   ========================================================= */

function setText(

    id,

    value

) {

    const element =

        document.getElementById(id);


    if (element) {

        element.textContent =

            value ?? "--";

    }

}


/* =========================================================

   HELPER: GET VALUE

   ========================================================= */

function getValue(

    id

) {

    const element =

        document.getElementById(id);


    return element

        ? element.value

        : "";

}


/* =========================================================

   HELPER: SET VALUE

   ========================================================= */

function setValue(

    id,

    value

) {

    const element =

        document.getElementById(id);


    if (element) {

        element.value =

            value ?? "";

    }

}


/* =========================================================

   EMPLOYEE FORM MESSAGE

   ========================================================= */

function showEmployeeFormMessage(

    message,

    type

) {

    const element =

        document.getElementById(

            "employeeFormMessage"

        );


    if (!element) {

        return;

    }


    element.textContent = message;

    element.className =

        `form-message ${type}`;

}


/* =========================================================

   CLEAR EMPLOYEE FORM MESSAGE

   ========================================================= */

function clearEmployeeFormMessage() {

    const element =

        document.getElementById(

            "employeeFormMessage"

        );


    if (!element) {

        return;

    }


    element.textContent = "";

    element.className =

        "form-message";

}


/* =========================================================

   GLOBAL MESSAGE

   ========================================================= */

function showGlobalMessage(

    message,

    type

) {

    /*

     * Use the attendance message area

     * when available.

     */

    showAttendanceMessage(

        message,

        type

    );

}


/* =========================================================

   READ RESPONSE

   ========================================================= */

async function readResponse(

    response

) {

    const contentType =

        response.headers.get(

            "content-type"

        );


    if (

        contentType &&

        contentType.includes(

            "application/json"

        )

    ) {

        return await response.json();

    }


    return await response.text();

}


/* =========================================================

   ERROR MESSAGE

   ========================================================= */

function extractErrorMessage(

    data

) {

    if (!data) {

        return "Something went wrong.";

    }


    if (typeof data === "string") {

        return data ||

            "Something went wrong.";

    }


    if (data.message) {

        return data.message;

    }


    if (data.error) {

        return data.error;

    }


    if (data.detail) {

        return data.detail;

    }


    return "Something went wrong.";

}


/* =========================================================

   HTML ESCAPE

   ========================================================= */

function escapeHtml(

    value

) {

    if (value === null ||

        value === undefined) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =========================================================

   LOGOUT USER

   ========================================================= */

function logoutUser() {

    localStorage.removeItem(

        "jwtToken"

    );

    localStorage.removeItem(

        "userEmail"

    );

    sessionStorage.removeItem(

        "jwtToken"

    );

    sessionStorage.removeItem(

        "userEmail"

    );


    window.location.href =

        "index.html";

}


/* =========================================================

   GLOBAL FUNCTIONS

   ========================================================= */

window.openEditEmployeeModal =

    openEditEmployeeModal;

window.openDeleteEmployeeModal =

    openDeleteEmployeeModal;