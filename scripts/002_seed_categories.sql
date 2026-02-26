-- Seed initial categories for the portfolio
-- Run this after 001_create_tables.sql

INSERT INTO public.categories (name, slug, description, icon, display_order) VALUES
  ('Branding', 'branding', 'Brand guidelines, style guides, and brand documentation.', 'ri-book-2-line', 0),
  ('Print Design', 'print-design', 'Brochures, flyers, posters, and print materials.', 'ri-printer-line', 1),
  ('Social Media', 'social-media', 'Posts, stories, covers, and social media graphics.', 'ri-instagram-line', 2),
  ('Presentations', 'presentations', 'Pitch decks, slide decks, and presentation design.', 'ri-slideshow-line', 3),
  ('Videos & Motion', 'videos-motion', 'Video editing, motion graphics, and animated content.', 'ri-play-circle-line', 4),
  ('Photography', 'photography', 'Portrait, Landscape, Aerial Views, and lot more.', 'ri-image-2-line', 5),
  ('Web Design', 'web-design', 'Landing Pages, Responsive web designs, Ecommerce.', 'ri-computer-line', 6),
  ('eLearning Course Designs', 'elearning', 'Articulate, Rise 36, LMS and lot more.', 'ri-book-open-line', 7)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order;
