from collections import defaultdict

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def move_activity_into_daily_rows(apps, schema_editor):
    LearnedWord = apps.get_model("library", "LearnedWord")
    PageRead = apps.get_model("library", "PageRead")
    DailyActivity = apps.get_model("library", "DailyLearningActivity")
    database = schema_editor.connection.alias

    words_by_day = defaultdict(list)
    for row in LearnedWord.objects.using(database).values("user_id", "date", "word").iterator():
        words_by_day[(row["user_id"], row["date"])].append(row["word"])

    pages_by_day = defaultdict(int)
    for row in PageRead.objects.using(database).values("user_id", "date").iterator():
        pages_by_day[(row["user_id"], row["date"])] += 1

    for user_id, day in words_by_day.keys() | pages_by_day.keys():
        learned_words = words_by_day[(user_id, day)]
        DailyActivity.objects.using(database).create(
            user_id=user_id,
            date=day,
            words_learned=len(learned_words),
            pages_read=pages_by_day[(user_id, day)],
            learned_words=learned_words,
        )


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("library", "0003_learning_activity"),
    ]

    operations = [
        migrations.CreateModel(
            name="DailyLearningActivity",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("date", models.DateField(db_index=True)),
                ("words_learned", models.PositiveIntegerField(default=0)),
                ("pages_read", models.PositiveIntegerField(default=0)),
                ("learned_words", models.JSONField(default=list)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="learning_activity", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ("-date",)},
        ),
        migrations.CreateModel(
            name="WordMeaning",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("word", models.CharField(max_length=120, unique=True)),
                ("definition", models.TextField()),
                ("part_of_speech", models.CharField(blank=True, max_length=80)),
                ("phonetic", models.CharField(blank=True, max_length=120)),
                ("example", models.TextField(blank=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.AddConstraint(
            model_name="dailylearningactivity",
            constraint=models.UniqueConstraint(fields=("user", "date"), name="daily_activity_user_date_uniq"),
        ),
        migrations.RunPython(move_activity_into_daily_rows, migrations.RunPython.noop),
        migrations.DeleteModel(name="LearnedWord"),
    ]
