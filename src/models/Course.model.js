// Course Model (placeholder for database integration)

class Course {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.instructor = data.instructor;
        this.price = data.price;
        this.duration = data.duration;
        this.level = data.level;
        this.category = data.category;
        this.image = data.image;
        this.lessons = data.lessons;
        this.students = data.students;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Get level badge class
    getLevelBadgeClass() {
        switch (this.level) {
            case 'Beginner':
                return 'bg-success';
            case 'Intermediate':
                return 'bg-warning text-dark';
            case 'Advanced':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    }

    // Format price
    getFormattedPrice() {
        return `$${this.price.toFixed(2)}`;
    }
}

export default Course;