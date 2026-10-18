import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("library", "0002_page"),
    ]

    operations = [
        migrations.CreateModel(
            name="LearnedWord",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("word", models.CharField(max_length=120)),
                ("date", models.DateField(db_index=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="learned_words", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ("word",)},
        ),
        migrations.CreateModel(
            name="PageRead",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("page_number", models.PositiveIntegerField()),
                ("date", models.DateField(db_index=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("resource", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="reading_records", to="library.resource")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="pages_read", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ("resource__title", "page_number")},
        ),
        migrations.AddConstraint(
            model_name="learnedword",
            constraint=models.UniqueConstraint(fields=("user", "date", "word"), name="learnword_user_day_uniq"),
        ),
        migrations.AddConstraint(
            model_name="pageread",
            constraint=models.UniqueConstraint(fields=("user", "resource", "page_number", "date"), name="readpage_user_day_uniq"),
        ),
        migrations.AddIndex(
            model_name="pageread",
            index=models.Index(fields=("user", "date"), name="page_read_user_date_idx"),
        ),
    ]
