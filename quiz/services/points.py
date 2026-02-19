def calculate_points(attempt):
    # -------- BASE POINTS --------
    QUESTIONS_BASE = 5  # points per question
    total_questions = attempt.question_attempts.count()
    base = total_questions * QUESTIONS_BASE

    # -------- ACCURACY BONUS --------
    accuracy = attempt.score / 100
    accuracy_bonus = int(base * accuracy)

    # -------- SPEED BONUS --------
    speed_bonus = 0
    if attempt.time_taken and attempt.time_taken < attempt.quiz.time_limit:
        speed_ratio = 1 - (attempt.time_taken / attempt.quiz.time_limit)
        speed_bonus = int(base * speed_ratio)

    total = base + accuracy_bonus + speed_bonus

    return {
        "base": base,
        "accuracy_bonus": accuracy_bonus,
        "speed_bonus": speed_bonus,
        "total": total,
    }
