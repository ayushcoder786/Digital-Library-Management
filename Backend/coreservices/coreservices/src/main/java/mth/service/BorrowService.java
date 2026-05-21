package mth.service;

import mth.entity.Book;
import mth.entity.BorrowRecord;
import mth.entity.User;
import mth.repository.BookRepository;
import mth.repository.BorrowRecordRepository;
import mth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BorrowService {

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    public List<BorrowRecord> getAll() {
        return borrowRecordRepository.findAll();
    }

    public Optional<BorrowRecord> getById(Long id) {
        return borrowRecordRepository.findById(id);
    }

    public List<BorrowRecord> getByUser(Long userId) {
        return borrowRecordRepository.findByUserId(userId);
    }

    public List<BorrowRecord> getOverdue() {
        return borrowRecordRepository.findOverdue();
    }

    @Transactional
    public BorrowRecord borrowBook(Long userId, Long bookId, int borrowDays) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new RuntimeException("Book not found: " + bookId));

        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("No available copies for book: " + book.getTitle());
        }

        long activeCount = borrowRecordRepository.countActiveBorrowsByUser(userId);
        if (activeCount >= user.getMaxBorrowLimit()) {
            throw new RuntimeException("Borrow limit reached for user: " + user.getUsername());
        }

        // Decrement available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        // Create borrow record
        BorrowRecord record = new BorrowRecord();
        record.setUser(user);
        record.setBook(book);
        record.setBorrowDate(LocalDate.now());
        record.setDueDate(LocalDate.now().plusDays(borrowDays));
        record.setStatus("BORROWED");
        record.setCreatedAt(LocalDateTime.now());

        return borrowRecordRepository.save(record);
    }

    @Transactional
    public BorrowRecord returnBook(Long borrowId) {
        BorrowRecord record = borrowRecordRepository.findById(borrowId)
            .orElseThrow(() -> new RuntimeException("Borrow record not found: " + borrowId));

        if ("RETURNED".equals(record.getStatus())) {
            throw new RuntimeException("Book already returned.");
        }

        record.setReturnDate(LocalDate.now());
        record.setStatus("RETURNED");

        // Increment available copies
        Book book = record.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        return borrowRecordRepository.save(record);
    }
}
