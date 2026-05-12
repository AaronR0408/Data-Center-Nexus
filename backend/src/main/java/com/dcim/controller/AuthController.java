package com.dcim.controller;

import com.dcim.dto.UserDto;
import com.dcim.entity.AppUser;
import com.dcim.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AppUserRepository userRepository;

    @GetMapping("/me")
    public UserDto.CurrentUser me(Authentication auth) {
        String username = auth.getName();
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return new UserDto.CurrentUser(user.getId(), user.getUsername(), user.getRole());
    }
}
