@echo off
cd android
SETLOCAL ENABLEDELAYEDEXPANSION

REM Define Gradle wrapper path
set GRADLE_WRAPPER=gradle/wrapper/gradle-wrapper.jar
set GRADLE_PROPS=gradle/wrapper/gradle-wrapper.properties

REM Run gradle to build release APK
java -cp %GRADLE_WRAPPER% org.gradle.wrapper.GradleWrapperMain assembleRelease

pause
