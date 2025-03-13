package BackEnd;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;

public class UserAuthorizationProvider implements AuthenticationProvider {
    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        if(!(authentication instanceof UsernamePasswordAuthenticationToken)) {
            return null;
        }
        authentication = (UsernamePasswordAuthenticationToken) authentication;
//        authentication.getPrincipal(); email
//        authentication.getCredentials();  haslo
        return authentication;

    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
