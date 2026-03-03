from app import db
from app.models import Service

def seed_services():
    all_services = [
        {
            "title": "Makeup Application",
            "category_name": "Cosmetics",
            "price": 50,
            "duration_minutes": 45,
            "description": "Professional makeup for any occasion",
            "image": "cosmetics-image-url",
        },
        {
            "title": "Bridal Makeup",
            "category_name": "Cosmetics",
            "price": 150,
            "duration_minutes": 120,
            "description": "Complete bridal makeup package",
            "image": "cosmetics-image-url",
        },
        {
            "title": "Hair Styling",
            "category_name": "Hairdressing",
            "price": 40,
            "duration_minutes": 60,
            "description": "Expert hair styling and design",
            "image": "hairdressing-image-url",
        },
        {
            "title": "Hair Coloring",
            "category_name": "Hairdressing",
            "price": 80,
            "duration_minutes": 120,
            "description": "Professional hair coloring service",
            "image": "hairdressing-image-url",
        },
        {
            "title": "Men's Haircut",
            "category_name": "Barber",
            "price": 25,
            "duration_minutes": 30,
            "description": "Classic and modern men's cuts",
            "image": "barber-image-url",
        },
        {
            "title": "Beard Grooming",
            "category_name": "Barber",
            "price": 20,
            "duration_minutes": 20,
            "description": "Beard trimming and styling",
            "image": "barber-image-url",
        },
        {
            "title": "Swedish Massage",
            "category_name": "Massages",
            "price": 70,
            "duration_minutes": 60,
            "description": "Relaxing full body massage",
            "image": "massage-image-url",
        },
        {
            "title": "Deep Tissue Massage",
            "category_name": "Massages",
            "price": 90,
            "duration_minutes": 60,
            "description": "Therapeutic deep tissue work",
            "image": "massage-image-url",
        },
        {
            "title": "Facial Treatment",
            "category_name": "Body Treatments",
            "price": 60,
            "duration_minutes": 45,
            "description": "Revitalizing facial care",
            "image": "body-treatment-image-url",
        },
        {
            "title": "Body Scrub",
            "category_name": "Body Treatments",
            "price": 75,
            "duration_minutes": 60,
            "description": "Exfoliating body treatment",
            "image": "body-treatment-image-url",
        },
        {
            "title": "Essential Oils Therapy",
            "category_name": "Aromatherapy",
            "price": 65,
            "duration_minutes": 60,
            "description": "Therapeutic aromatherapy session",
            "image": "aromatherapy-image-url",
        },
        {
            "title": "Relaxation Aromatherapy",
            "category_name": "Aromatherapy",
            "price": 55,
            "duration_minutes": 45,
            "description": "Calming aromatherapy experience",
            "image": "aromatherapy-image-url",
        },
    ]

    created_count = 0

    for service_data in all_services:
        # Skip if service already exists
        existing = Service.query.filter_by(
            name=service_data["title"],
            category_name=service_data["category_name"]
        ).first()
        if existing:
            continue

        service = Service(
            name=service_data["title"],
            category_name=service_data["category_name"],
            price=service_data["price"],
            duration_minutes=service_data["duration_minutes"],
            description=service_data.get("description"),
            image=service_data.get("image")
        )

        db.session.add(service)
        created_count += 1

    db.session.commit()
    print(f"Services seeded successfully. Created: {created_count}, Total: {len(all_services)}")
