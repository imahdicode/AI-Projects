package com.mediscript.clinic.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mediscript.clinic.model.QueueItem;

public interface QueueItemRepository extends JpaRepository<QueueItem, String> {
    List<QueueItem> findByDoctorIdOrderByTokenNumberAsc(String doctorId);
    List<QueueItem> findAllByOrderByTokenNumberAsc();
}
