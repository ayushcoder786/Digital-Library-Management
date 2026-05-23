package mth.service;

import mth.entity.Category;
import mth.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    public Optional<Category> getById(Long id) {
        return categoryRepository.findById(id);
    }

    public Category create(Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("Category with name '" + category.getName() + "' already exists.");
        }
        return categoryRepository.save(category);
    }

    public Category update(Long id, Category updated) {
        Category existing = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        return categoryRepository.save(existing);
    }

    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
