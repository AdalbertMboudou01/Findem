package com.memoire.assistant.service;

import com.memoire.assistant.model.ChatbotQuestion;
import com.memoire.assistant.model.Job;
import com.memoire.assistant.repository.ChatbotQuestionRepository;
import com.memoire.assistant.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ChatbotQuestionService {
    @Autowired
    private ChatbotQuestionRepository chatbotQuestionRepository;
    @Autowired
    private JobRepository jobRepository;

    public List<ChatbotQuestion> getQuestionsForJob(UUID jobId) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        return chatbotQuestionRepository.findByJobOrderByOrderIndexAsc(job);
    }

    public ChatbotQuestion addQuestion(UUID jobId, String questionText, int orderIndex) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        ChatbotQuestion question = new ChatbotQuestion();
        question.setJob(job);
        question.setQuestionText(questionText);
        question.setOrderIndex(orderIndex);
        return chatbotQuestionRepository.save(question);
    }

    public void deleteQuestion(UUID questionId) {
        chatbotQuestionRepository.deleteById(questionId);
    }

    public Optional<ChatbotQuestion> updateQuestion(UUID questionId, String questionText, int orderIndex) {
        Optional<ChatbotQuestion> opt = chatbotQuestionRepository.findById(questionId);
        opt.ifPresent(q -> {
            q.setQuestionText(questionText);
            q.setOrderIndex(orderIndex);
            chatbotQuestionRepository.save(q);
        });
        return opt;
    }
}
