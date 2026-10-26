"""Configurable skill keywords, role requirements and company emphasis profiles.
Add a role or company by editing these dictionaries only."""
SKILLS = {
    "python": ("Python", ["python"]),
    "javascript": ("JavaScript", ["javascript", "node", "nodejs"]),
    "typescript": ("TypeScript", ["typescript"]),
    "react": ("React", ["react", "nextjs", "next.js", "vue", "angular"]),
    "html_css": ("HTML/CSS", ["html", "css", "tailwind", "sass"]),
    "sql": ("SQL / Databases", ["sql", "postgres", "mysql", "sqlite", "mongodb", "database"]),
    "rest_apis": ("REST APIs / Backend", ["api", "rest", "fastapi", "flask", "django", "express", "backend", "server"]),
    "docker": ("Docker / Deployment", ["docker", "kubernetes", "deploy", "heroku", "vercel", "aws"]),
    "testing": ("Testing", ["test", "tests", "pytest", "jest", "unittest"]),
    "git_ci": ("CI / Automation", ["ci", "github actions", "workflow", "automation"]),
    "machine_learning": ("Machine Learning", ["machine learning", "ml", "scikit", "sklearn", "classification", "regression", "model", "prediction"]),
    "deep_learning": ("Deep Learning", ["pytorch", "tensorflow", "keras", "neural", "deep learning", "nlp", "llm", "transformer"]),
    "data_analysis": ("Data Analysis", ["pandas", "numpy", "analysis", "analytics", "jupyter notebook", "jupyter", "visualization", "dashboard", "data"]),
    "algorithms": ("Algorithms & Data Structures", ["algorithm", "algorithms", "leetcode", "data structure", "data structures", "dsa"]),
    "java_cpp": ("Java / C++ / Go", ["java", "c++", "golang", "go", "rust", "c#"]),
}
ROLES = {
    "Python Developer": {"skills": {"python": 3, "rest_apis": 2, "testing": 2, "sql": 1, "docker": 1, "git_ci": 1, "algorithms": 1},
        "projects": ["A FastAPI CRUD service with a database, pytest suite and Docker setup", "A CLI automation tool published with README and tests", "A web scraper plus data pipeline with scheduled runs"]},
    "Software Engineer": {"skills": {"algorithms": 2, "testing": 2, "rest_apis": 2, "sql": 1, "git_ci": 1, "docker": 1, "javascript": 1, "python": 1, "java_cpp": 1},
        "projects": ["A full-stack app with auth, database and tests", "A well-documented algorithms/data-structures library with unit tests", "A containerised microservice with CI"]},
    "AI/ML Engineer": {"skills": {"python": 2, "machine_learning": 3, "deep_learning": 2, "data_analysis": 2, "docker": 1, "testing": 1, "rest_apis": 1},
        "projects": ["An end-to-end ML project (data, training, evaluation, README with metrics)", "A model served through a FastAPI endpoint with a demo UI", "A deep-learning/NLP experiment with reproducible notebooks"]},
    "Frontend Developer": {"skills": {"javascript": 3, "react": 3, "html_css": 2, "typescript": 2, "testing": 1, "rest_apis": 1},
        "projects": ["A responsive React app consuming a public API, deployed with a live demo", "A design-system/component library with tests", "A TypeScript dashboard with charts and accessibility work"]},
    "Backend Developer": {"skills": {"rest_apis": 3, "sql": 2, "testing": 2, "docker": 2, "git_ci": 1, "python": 1, "javascript": 1, "java_cpp": 1},
        "projects": ["A REST API with authentication, migrations and OpenAPI docs", "A background-job/queue based service with Docker Compose", "An API with automated tests and a CI pipeline"]},
    "Data Analyst": {"skills": {"data_analysis": 3, "sql": 3, "python": 2, "machine_learning": 1, "html_css": 0},
        "projects": ["A public-dataset analysis notebook with clear findings", "An interactive dashboard with a written insight summary", "A SQL project showing cleaning, joins and window functions"]},
}
for _r in ROLES.values():
    _r["skills"] = {k: v for k, v in _r["skills"].items() if v > 0}
# Illustrative, user-editable emphasis. NOT official hiring criteria.
COMPANIES = {
    "google": {"label": "Google", "emphasis": {"algorithms": 2, "testing": 1}},
    "amazon": {"label": "Amazon", "emphasis": {"algorithms": 1, "docker": 1, "rest_apis": 1}},
    "microsoft": {"label": "Microsoft", "emphasis": {"testing": 1, "rest_apis": 1, "git_ci": 1}},
    "meta": {"label": "Meta", "emphasis": {"algorithms": 1, "javascript": 1, "react": 1}},
}
