// Home Controller

export const getHomePage = (req, res) => {
    res.render("pages/home", {
        title: "TechLand - Home",
        featuredProducts: [],
        featuredCourses: []
    });
};

export const getAboutPage = (req, res) => {
    res.render("pages/about", {
        title: "About Us - TechLand"
    });
};

export const getContactPage = (req, res) => {
    res.render("pages/contact", {
        title: "Contact - TechLand"
    });
};