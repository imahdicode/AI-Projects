package com.mediscript.clinic.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.mediscript.clinic.model.QueueItem;
import com.mediscript.clinic.repository.QueueItemRepository;

@RestController
@RequestMapping("/api/queue")
public class QueueController {

    private final QueueItemRepository queueRepository;

    public QueueController(QueueItemRepository queueRepository) {
        this.queueRepository = queueRepository;
    }

    @GetMapping
    public List<QueueItem> list(
        @RequestHeader(value = "X-Doctor-Id", required = false) String doctorId,
        @RequestHeader(value = "X-Doctor-Role", required = false) String role
    ) {
        if ("ADMIN".equalsIgnoreCase(role)) {
            return queueRepository.findAllByOrderByTokenNumberAsc();
        }
        if (doctorId != null && !doctorId.isBlank()) {
            return queueRepository.findByDoctorIdOrderByTokenNumberAsc(doctorId);
        }
        return queueRepository.findAllByOrderByTokenNumberAsc();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public QueueItem create(
        @RequestBody QueueItem item,
        @RequestHeader(value = "X-Doctor-Id", required = false) String doctorId
    ) {
        if (item.getId() == null || item.getId().isBlank()) {
            item.setId("queue-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (item.getDoctorId() == null || item.getDoctorId().isBlank()) {
            item.setDoctorId(doctorId != null ? doctorId : "1");
        }
        if (item.getTokenNumber() <= 0) {
            item.setTokenNumber((int) (queueRepository.count() + 1));
        }
        return queueRepository.save(item);
    }

    @PutMapping("/{id}")
    public QueueItem update(@PathVariable String id, @RequestBody QueueItem item) {
        item.setId(id);
        return queueRepository.save(item);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        queueRepository.deleteById(id);
    }
}
