package mth.service;

import mth.entity.Book;
import mth.entity.Category;
import mth.repository.BookRepository;
import mth.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Book> getAll() {
        return bookRepository.findAll();
    }

    public Optional<Book> getById(Long id) {
        return bookRepository.findById(id);
    }

    public List<Book> getAvailable() {
        return bookRepository.findByIsActiveTrueAndAvailableCopiesGreaterThan(0);
    }

    public List<Book> getByCategory(Long categoryId) {
        return bookRepository.findByCategoryId(categoryId);
    }

    public List<Book> search(String keyword) {
        return bookRepository.searchByKeyword(keyword);
    }

    public Book create(Book book) {
        if (book.getIsbn() != null && bookRepository.findByIsbn(book.getIsbn()).isPresent()) {
            throw new RuntimeException("Book with ISBN '" + book.getIsbn() + "' already exists.");
        }
        return bookRepository.save(book);
    }

    public Book update(Long id, Book updated) {
        Book existing = bookRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));

        existing.setTitle(updated.getTitle());
        existing.setAuthor(updated.getAuthor());
        existing.setIsbn(updated.getIsbn());
        existing.setDescription(updated.getDescription());
        existing.setPublishedDate(updated.getPublishedDate());
        existing.setPublisher(updated.getPublisher());
        existing.setTotalCopies(updated.getTotalCopies());
        existing.setAvailableCopies(updated.getAvailableCopies());
        existing.setCoverImageUrl(updated.getCoverImageUrl());
        existing.setLanguage(updated.getLanguage());
        existing.setPageCount(updated.getPageCount());
        existing.setIsActive(updated.getIsActive());

        if (updated.getCategory() != null && updated.getCategory().getId() != null) {
            Category cat = categoryRepository.findById(updated.getCategory().getId())
                .orElse(null);
            existing.setCategory(cat);
        }

        return bookRepository.save(existing);
    }

    public void delete(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new RuntimeException("Book not found with id: " + id);
        }
        bookRepository.deleteById(id);
    }
}
