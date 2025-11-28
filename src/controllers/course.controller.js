// Course Controller

// Temporary in-memory course storage (replace with database later)
const courses = [
    {
        id: 1,
        name: "JavaScript Full Course",
        description: "Complete JavaScript course from basics to advanced concepts",
        instructor: "John Doe",
        price: 49.99,
        duration: "20 hours",
        level: "Beginner",
        category: "Programming",
        image: "/images/courses/javascript.jpg",
        lessons: 45,
        students: 1250
    },
    {
        id: 2,
        name: "React & Node.js Masterclass",
        description: "Build full-stack applications with React and Node.js",
        instructor: "Jane Smith",
        price: 79.99,
        duration: "35 hours",
        level: "Intermediate",
        category: "Web Development",
        image: "/images/courses/react-node.jpg",
        lessons: 68,
        students: 890
    },
    {
        id: 3,
        name: "Python for Data Science",
        description: "Learn Python for data analysis and machine learning",
        instructor: "Mike Johnson",
        price: 59.99,
        duration: "25 hours",
        level: "Intermediate",
        category: "Data Science",
        image: "/images/courses/python.jpg",
        lessons: 52,
        students: 2100
    },
    {
        id: 4,
        name: "UI/UX Design Fundamentals",
        description: "Master the principles of user interface and experience design",
        instructor: "Sarah Wilson",
        price: 39.99,
        duration: "15 hours",
        level: "Beginner",
        category: "Design",
        image: "/images/courses/uiux.jpg",
        lessons: 30,
        students: 650
    }
];

export const getAllCourses = (req, res) => {
    const { category, level, search, sort } = req.query;
    let filteredCourses = [...courses];

    // Filter by category
    if (category) {
        filteredCourses = filteredCourses.filter(c => 
            c.category.toLowerCase() === category.toLowerCase()
        );
    }

    // Filter by level
    if (level) {
        filteredCourses = filteredCourses.filter(c => 
            c.level.toLowerCase() === level.toLowerCase()
        );
    }

    // Search by name
    if (search) {
        filteredCourses = filteredCourses.filter(c => 
            c.name.toLowerCase().includes(search.toLowerCase())
        );
    }

    // Sort courses
    if (sort === "price-asc") {
        filteredCourses.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
        filteredCourses.sort((a, b) => b.price - a.price);
    } else if (sort === "popular") {
        filteredCourses.sort((a, b) => b.students - a.students);
    }

    // Get unique categories and levels
    const categories = [...new Set(courses.map(c => c.category))];
    const levels = [...new Set(courses.map(c => c.level))];

    res.render("pages/courses/index", {
        title: "Courses - TechLand",
        courses: filteredCourses,
        categories,
        levels,
        currentCategory: category || "",
        currentLevel: level || "",
        currentSearch: search || "",
        currentSort: sort || ""
    });
};

export const getCourseById = (req, res) => {
    const { id } = req.params;
    const course = courses.find(c => c.id === parseInt(id));

    if (!course) {
        return res.status(404).render("errors/404", {
            title: "Course Not Found"
        });
    }

    // Get related courses (same category)
    const relatedCourses = courses
        .filter(c => c.category === course.category && c.id !== course.id)
        .slice(0, 3);

    res.render("pages/courses/detail", {
        title: `${course.name} - TechLand`,
        course,
        relatedCourses
    });
};

// Export courses array for use in other controllers
export { courses };