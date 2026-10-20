from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("library", "0005_wordmeaning_source"),
    ]

    operations = [
        migrations.AddField(
            model_name="resource",
            name="is_public",
            field=models.BooleanField(db_index=True, default=False),
        ),
    ]
