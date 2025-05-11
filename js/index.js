const elements = {
    rowData: document.getElementById("rowData"),
    searchContainer: document.getElementById("searchContainer"),
    loadingScreen: $(".loading-screen"),
    innerLoadingScreen: $(".inner-loading-screen"),
    sideNav: $(".side-nav-menu"),
    navIcon: $(".open-close-icon"),
    navLinks: $(".links li")
};


$(document).ready(() => {
    searchByName("").then(() => {
        elements.loadingScreen.fadeOut(500);
        $("body").css("overflow", "visible");
    });
});


const navManager = {
    open: () => {
        elements.sideNav.animate({ left: 0 }, 500);
        elements.navIcon.removeClass("fa-align-justify").addClass("fa-x");
        elements.navLinks.each((i, el) => {
            $(el).animate({ top: 0 }, (i + 5) * 100);
        });
    },
    close: () => {
        const boxWidth = $(".side-nav-menu .nav-tab").outerWidth();
        elements.sideNav.animate({ left: -boxWidth }, 500);
        elements.navIcon.addClass("fa-align-justify").removeClass("fa-x");
        elements.navLinks.animate({ top: 300 }, 500);
    },
    toggle: () => elements.sideNav.css("left") == "0px" ? navManager.close() : navManager.open()
};

elements.navIcon.click(navManager.toggle);


const display = {
    meals: (meals) => {
        elements.rowData.innerHTML = meals.map(meal => `
            <div class="col-md-3">
                <div onclick="getMealDetails('${meal.idMeal}')" class="meal position-relative overflow-hidden rounded-2 cursor-pointer">
                    <img class="w-100" src="${meal.strMealThumb}" alt="${meal.strMeal}">
                    <div class="meal-layer position-absolute d-flex align-items-center text-black p-2">
                        <h3>${meal.strMeal}</h3>
                    </div>
                </div>
            </div>
        `).join('');
    },
    categories: (categories) => {
        elements.rowData.innerHTML = categories.map(cat => `
            <div class="col-md-3">
                <div onclick="getCategoryMeals('${cat.strCategory}')" class="meal position-relative overflow-hidden rounded-2 cursor-pointer">
                    <img class="w-100" src="${cat.strCategoryThumb}" alt="${cat.strCategory}">
                    <div class="meal-layer position-absolute text-center text-black p-2">
                        <h3>${cat.strCategory}</h3>
                        <p>${cat.strCategoryDescription.split(" ").slice(0,20).join(" ")}</p>
                    </div>
                </div>
            </div>
        `).join('');
    },
    areas: (areas) => {
        elements.rowData.innerHTML = areas.map(area => `
            <div class="col-md-3">
                <div onclick="getAreaMeals('${area.strArea}')" class="rounded-2 text-center cursor-pointer">
                    <i class="fa-solid fa-house-laptop fa-4x"></i>
                    <h3>${area.strArea}</h3>
                </div>
            </div>
        `).join('');
    },
    ingredients: (ingredients) => {
        elements.rowData.innerHTML = ingredients.map(ing => `
            <div class="col-md-3">
                <div onclick="getIngredientsMeals('${ing.strIngredient}')" class="rounded-2 text-center cursor-pointer">
                    <i class="fa-solid fa-drumstick-bite fa-4x"></i>
                    <h3>${ing.strIngredient}</h3>
                    <p>${ing.strDescription?.split(" ").slice(0,20).join(" ") || ''}</p>
                </div>
            </div>
        `).join('');
    },
    mealDetails: (meal) => {
        const ingredients = Array.from({length: 20}, (_, i) => 
            meal[`strIngredient${i+1}`] ? 
            `<li class="alert alert-info m-2 p-1">${meal[`strMeasure${i+1}`]} ${meal[`strIngredient${i+1}`]}</li>` : 
            ''
        ).join('');
        
        const tags = meal.strTags?.split(",") || [];
        const tagsStr = tags.map(tag => `<li class="alert alert-danger m-2 p-1">${tag}</li>`).join('');
        
        elements.rowData.innerHTML = `
            <div class="col-md-4">
                <img class="w-100 rounded-3" src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <h2>${meal.strMeal}</h2>
            </div>
            <div class="col-md-8">
                <h2>Instructions</h2>
                <p>${meal.strInstructions}</p>
                <h3><span class="fw-bolder">Area: </span>${meal.strArea}</h3>
                <h3><span class="fw-bolder">Category: </span>${meal.strCategory}</h3>
                <h3>Recipes:</h3>
                <ul class="list-unstyled d-flex g-3 flex-wrap">${ingredients}</ul>
                <h3>Tags:</h3>
                <ul class="list-unstyled d-flex g-3 flex-wrap">${tagsStr}</ul>
                <a target="_blank" href="${meal.strSource}" class="btn btn-success">Source</a>
                <a target="_blank" href="${meal.strYoutube}" class="btn btn-danger">Youtube</a>
            </div>`;
    }
};


const api = {
    fetchData: async (url) => {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            return { meals: null };
        }
    },
    searchByName: async (term) => {
        navManager.close();
        elements.rowData.innerHTML = '';
        elements.innerLoadingScreen.fadeIn(300);
        
        const data = await api.fetchData(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`);
        display.meals(data.meals || []);
        
        elements.innerLoadingScreen.fadeOut(300);
    },
    searchByFirstLetter: async (letter) => {
        navManager.close();
        elements.rowData.innerHTML = '';
        elements.innerLoadingScreen.fadeIn(300);
        
        const term = letter || 'a';
        const data = await api.fetchData(`https://www.themealdb.com/api/json/v1/1/search.php?f=${term}`);
        display.meals(data.meals || []);
        
        elements.innerLoadingScreen.fadeOut(300);
    },
    getCategories: async () => {
        elements.rowData.innerHTML = '';
        elements.innerLoadingScreen.fadeIn(300);
        elements.searchContainer.innerHTML = '';
        
        const data = await api.fetchData('https://www.themealdb.com/api/json/v1/1/categories.php');
        display.categories(data.categories || []);
        
        elements.innerLoadingScreen.fadeOut(300);
    },
    getAreas: async () => {
        elements.rowData.innerHTML = '';
        elements.innerLoadingScreen.fadeIn(300);
        elements.searchContainer.innerHTML = '';
        
        const data = await api.fetchData('https://www.themealdb.com/api/json/v1/1/list.php?a=list');
        display.areas(data.meals || []);
        
        elements.innerLoadingScreen.fadeOut(300);
    },
    getIngredients: async () => {
        elements.rowData.innerHTML = '';
        elements.innerLoadingScreen.fadeIn(300);
        elements.searchContainer.innerHTML = '';
        
        const data = await api.fetchData('https://www.themealdb.com/api/json/v1/1/list.php?i=list');
        display.ingredients(data.meals?.slice(0, 20) || []);
        
        elements.innerLoadingScreen.fadeOut(300);
    },
    getCategoryMeals: async (category) => {
        elements.rowData.innerHTML = '';
        elements.innerLoadingScreen.fadeIn(300);
        
        const data = await api.fetchData(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
        display.meals(data.meals?.slice(0, 20) || []);
        
        elements.innerLoadingScreen.fadeOut(300);
    },
    getAreaMeals: async (area) => {
        elements.rowData.innerHTML = '';
        elements.innerLoadingScreen.fadeIn(300);
        
        const data = await api.fetchData(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`);
        display.meals(data.meals?.slice(0, 20) || []);
        
        elements.innerLoadingScreen.fadeOut(300);
    },
    getIngredientsMeals: async (ingredient) => {
        elements.rowData.innerHTML = '';
        elements.innerLoadingScreen.fadeIn(300);
        
        const data = await api.fetchData(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
        display.meals(data.meals?.slice(0, 20) || []);
        
        elements.innerLoadingScreen.fadeOut(300);
    },
    getMealDetails: async (mealId) => {
        navManager.close();
        elements.rowData.innerHTML = '';
        elements.innerLoadingScreen.fadeIn(300);
        elements.searchContainer.innerHTML = '';
        
        const data = await api.fetchData(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        if (data.meals) display.mealDetails(data.meals[0]);
        
        elements.innerLoadingScreen.fadeOut(300);
    }
};


const search = {
    showInputs: () => {
        elements.searchContainer.innerHTML = `
            <div class="row py-4">
                <div class="col-md-6">
                    <input onkeyup="api.searchByName(this.value)" class="form-control bg-transparent text-white" 
                           type="text" placeholder="Search By Name">
                </div>
                <div class="col-md-6">
                    <input onkeyup="api.searchByFirstLetter(this.value)" maxlength="1" 
                           class="form-control bg-transparent text-white" type="text" 
                           placeholder="Search By First Letter">
                </div>
            </div>`;
        elements.rowData.innerHTML = "";
    }
};


const contact = {
    init: () => {
        elements.rowData.innerHTML = `
            <div class="contact min-vh-100 d-flex justify-content-center align-items-center">
                <div class="container w-75 text-center">
                    <div class="row g-4">
                        ${this.generateInput('name', 'text', 'Enter Your Name', 'Special characters and numbers not allowed')}
                        ${this.generateInput('email', 'email', 'Enter Your Email', 'Email not valid *exemple@yyy.zzz')}
                        ${this.generateInput('phone', 'text', 'Enter Your Phone', 'Enter valid Phone Number')}
                        ${this.generateInput('age', 'number', 'Enter Your Age', 'Enter valid age')}
                        ${this.generateInput('password', 'password', 'Enter Your Password', 'Minimum eight characters, at least one letter and one number')}
                        ${this.generateInput('repassword', 'password', 'Repassword', 'Passwords do not match')}
                    </div>
                    <button id="submitBtn" disabled class="btn btn-outline-danger px-2 mt-3">Submit</button>
                </div>
            </div>`;
        
        this.setupValidation();
    },
    generateInput: (id, type, placeholder, errorMsg) => `
        <div class="col-md-6">
            <input id="${id}Input" onkeyup="contact.validate()" type="${type}" 
                   class="form-control" placeholder="${placeholder}">
            <div id="${id}Alert" class="alert alert-danger w-100 mt-2 d-none">${errorMsg}</div>
        </div>
    `,
    setupValidation: () => {
        const inputs = ['name', 'email', 'phone', 'age', 'password', 'repassword'];
        inputs.forEach(id => {
            document.getElementById(`${id}Input`).addEventListener('focus', () => {
                this[`${id}Touched`] = true;
                this.validate();
            });
        });
    },
    nameTouched: false,
    emailTouched: false,
    phoneTouched: false,
    ageTouched: false,
    passwordTouched: false,
    repasswordTouched: false,
    validate: () => {
        const validations = {
            name: /^[a-zA-Z ]+$/.test(document.getElementById("nameInput").value),
            email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(document.getElementById("emailInput").value),
            phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(document.getElementById("phoneInput").value),
            age: /^(0?[1-9]|[1-9][0-9]|[1][1-9][1-9]|200)$/.test(document.getElementById("ageInput").value),
            password: /^(?=.*\d)(?=.*[a-z])[0-9a-zA-Z]{8,}$/.test(document.getElementById("passwordInput").value),
            repassword: document.getElementById("repasswordInput").value === document.getElementById("passwordInput").value
        };
        
        Object.keys(validations).forEach(key => {
            const alertElement = document.getElementById(`${key}Alert`);
            if (this[`${key}Touched`]) {
                alertElement.classList.toggle('d-none', validations[key]);
                alertElement.classList.toggle('d-block', !validations[key]);
            }
        });
        
        const submitBtn = document.getElementById("submitBtn");
        submitBtn.disabled = !Object.values(validations).every(v => v);
    }
};


window.searchByName = api.searchByName;
window.searchByFirstLetter = api.searchByFirstLetter;
window.getCategories = api.getCategories;
window.getArea = api.getAreas;
window.getIngredients = api.getIngredients;
window.getCategoryMeals = api.getCategoryMeals;
window.getAreaMeals = api.getAreaMeals;
window.getIngredientsMeals = api.getIngredientsMeals;
window.getMealDetails = api.getMealDetails;
window.showSearchInputs = search.showInputs;
window.showContacts = contact.init;

/////////////////////


window.showContacts = function() {
    navManager.close();
    elements.rowData.innerHTML = '';
    elements.searchContainer.innerHTML = '';
    contact.init();
};
