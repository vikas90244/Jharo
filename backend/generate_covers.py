"""
Script to generate cover images for existing books that don't have them
Run with: python manage.py shell < generate_covers.py
"""

import pymupdf
from library.models import Resource
from pathlib import Path
from django.conf import settings
from django.core.files.base import ContentFile

def generate_covers():
    """Generate cover images for all resources without covers"""
    resources_without_covers = Resource.objects.filter(cover_image='')
    
    print(f"Found {resources_without_covers.count()} resources without covers")
    
    for resource in resources_without_covers:
        try:
            print(f"Processing: {resource.title}")
            
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
                
                print(f" Generated cover for: {resource.title}")
            else:
                print(f"PDF has no pages: {resource.title}")
                
            doc.close()
            
        except Exception as e:
            print(f" Error processing {resource.title}: {e}")
    
    print("\n Done!")

if __name__ == "__main__":
    generate_covers()
else:
    # When running via shell
    generate_covers()
