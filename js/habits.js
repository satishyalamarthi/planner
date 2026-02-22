/* Mobile responsive styles for habit cards */

@media (max-width: 768px) {
    .habit-card {
        flex-direction: column;
        align-items: stretch;
    }

    .habit-value {
        min-width: auto;
        width: 100%;
        margin-top: 0.5rem;
    }

    .habit-value-input {
        width: 100%;
    }

    .habit-actions {
        margin-top: 0.5rem;
        justify-content: flex-end;
    }

    .habit-info {
        width: 100%;
    }
}