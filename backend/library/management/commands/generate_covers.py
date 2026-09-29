"""
Django management command to generate cover images for books
Run with: python manage.py generate_covers
"""

from django.core.management.base import BaseCommand
import pymupdf
from library.models import Resource
from django.core.files.base import ContentFile


class Command(BaseCommand):
    help = 'Generate cover images for resources that don\'t have them'

    def add_arguments(self, parser):
        parser.add_argument(
            '--all',
            action='store_true',
            help='Regenerate covers for all resources (even those with existing covers)',
        )

    def handle(self, *args, **options):
        regenerate_all = options['all']
        
        if regenerate_all:
            resources = Resource.objects.all()
            self.stdout.write(self.style.WARNING(
                f'Regenerating covers for ALL {resources.count()} resources'
            ))
        else:
            resources = Resource.objects.filter(cover_image='')
            self.stdout.write(self.style.SUCCESS(
                f'Found {resources.count()} resources without covers'
            ))
        
        if resources.count() == 0:
            self.stdout.write(self.style.SUCCESS('No resources to process!'))
            return
        
        success_count = 0
        error_count = 0
        
        for resource in resources:
            try:
                self.stdout.write(f'Processing: {resource.title}')
                
                # Open PDF
                doc = pymupdf.open(resource.object_path.path)
                
                if len(doc) > 0:
                    # Get first page
                    first_page = doc[0]
                    
                    # Render at 2x resolution for quality
                    zoom = 2
                    mat = pymupdf.Matrix(zoom, zoom)
                    pix = first_page.get_pixmap(matrix=mat)
                    
                    # Convert to PNG bytes
                    cover_image_bytes = pix.tobytes("png")
                    
                    # Save cover image
                    cover_filename = f"cover_page_0.png"
                    resource.cover_image.save(
                        cover_filename,
                        ContentFile(cover_image_bytes),
                        save=True
                    )
                    
                    self.stdout.write(self.style.SUCCESS(
                        f'  ✓ Generated cover for: {resource.title}'
                    ))
                    success_count += 1
                else:
                    self.stdout.write(self.style.WARNING(
                        f'  ⚠ PDF has no pages: {resource.title}'
                    ))
                    error_count += 1
                    
                doc.close()
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(
                    f'  ✗ Error processing {resource.title}: {e}'
                ))
                error_count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'\n✨ Done! Success: {success_count}, Errors: {error_count}'
        ))
