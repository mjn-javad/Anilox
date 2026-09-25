try:
    import paramiko
    print("paramiko", paramiko.__version__)
except Exception as exc:
    print(type(exc).__name__, str(exc))
