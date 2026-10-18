from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("library", "0004_daily_meanings"),
    ]

    operations = [
        migrations.AddField(
            model_name="wordmeaning",
            name="source_name",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="wordmeaning",
            name="source_url",
            field=models.URLField(blank=True),
        ),
    ]
